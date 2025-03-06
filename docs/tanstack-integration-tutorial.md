# Using Tanstack Query with ProjectManager

This tutorial demonstrates how to integrate Tanstack Query (formerly React Query) with ProjectManager and DCSStorageService for efficient data management and caching.

## Setup

### 1. Installation

Install the required dependencies:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Query Client Setup

Create a query client configuration file `src/config/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      retry: 2,
      refetchOnWindowFocus: true
    }
  }
});
```

### 3. Provider Setup

Update your app to include both ProjectManager and QueryClient providers:

```typescript
// src/App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './config/queryClient';
import { ProjectManagerProvider } from './contexts/ProjectManagerContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectManagerProvider>
        {/* Your app components */}
      </ProjectManagerProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Custom Hooks

### Project Queries

Create a file for project-related queries `src/hooks/queries/useProjectQueries.ts`:

```typescript
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { useProjectManager } from '../../contexts/ProjectManagerContext';
import type { Project, CreateProjectInput } from '@core/project-manager/types';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const
};

// Get all projects
export function useProjects(options?: UseQueryOptions<Project[]>) {
  const projectManager = useProjectManager();
  
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectManager.getAllProjects(),
    ...options
  });
}

// Get a single project
export function useProject(id: string, options?: UseQueryOptions<Project>) {
  const projectManager = useProjectManager();
  
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectManager.getProject(id),
    ...options
  });
}

// Create project mutation
export function useCreateProject(
  options?: UseMutationOptions<Project, Error, CreateProjectInput>
) {
  const projectManager = useProjectManager();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => 
      projectManager.createProject(
        input.name,
        input.teamId,
        input.sourceResources,
        input.targetResources,
        input.description
      ),
    onSuccess: (data) => {
      // Update projects list
      queryClient.setQueryData<Project[]>(
        projectKeys.lists(),
        (old) => old ? [...old, data] : [data]
      );
      // Update individual project
      queryClient.setQueryData(projectKeys.detail(data.id), data);
    },
    ...options
  });
}

// Update project mutation
export function useUpdateProject(
  options?: UseMutationOptions<Project, Error, Project>
) {
  const projectManager = useProjectManager();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Project) => projectManager.updateProject(project),
    onSuccess: (data) => {
      // Update projects list
      queryClient.setQueryData<Project[]>(
        projectKeys.lists(),
        (old) => old?.map(p => p.id === data.id ? data : p)
      );
      // Update individual project
      queryClient.setQueryData(projectKeys.detail(data.id), data);
    },
    ...options
  });
}

// Delete project mutation
export function useDeleteProject(
  options?: UseMutationOptions<void, Error, string>
) {
  const projectManager = useProjectManager();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectManager.deleteProject(id),
    onSuccess: (_, id) => {
      // Update projects list
      queryClient.setQueryData<Project[]>(
        projectKeys.lists(),
        (old) => old?.filter(p => p.id !== id)
      );
      // Remove individual project from cache
      queryClient.removeQueries(projectKeys.detail(id));
    },
    ...options
  });
}
```

### Milestone Queries

Create milestone-related queries in `src/hooks/queries/useMilestoneQueries.ts`:

```typescript
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { useProjectManager } from '../../contexts/ProjectManagerContext';
import type { Milestone, CreateMilestoneInput } from '@core/project-manager/types';

export const milestoneKeys = {
  all: ['milestones'] as const,
  lists: () => [...milestoneKeys.all, 'list'] as const,
  list: (projectId: string) => [...milestoneKeys.lists(), { projectId }] as const,
  details: () => [...milestoneKeys.all, 'detail'] as const,
  detail: (id: string) => [...milestoneKeys.details(), id] as const
};

export function useProjectMilestones(
  projectId: string,
  options?: UseQueryOptions<Milestone[]>
) {
  const projectManager = useProjectManager();

  return useQuery({
    queryKey: milestoneKeys.list(projectId),
    queryFn: () => projectManager.getMilestonesByProject(projectId),
    ...options
  });
}

export function useCreateMilestone(
  options?: UseMutationOptions<Milestone, Error, CreateMilestoneInput>
) {
  const projectManager = useProjectManager();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) => projectManager.createMilestone(
      input.name,
      input.projectId,
      input.teamId,
      input.resourceScope
    ),
    onSuccess: (data) => {
      // Update milestones list
      queryClient.setQueryData<Milestone[]>(
        milestoneKeys.list(data.projectId),
        (old) => old ? [...old, data] : [data]
      );
    },
    ...options
  });
}
```

## Example Components

### Project List with Infinite Loading

```typescript
// src/components/ProjectList.tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { projectKeys } from '../hooks/queries/useProjectQueries';

export function ProjectList() {
  const projectManager = useProjectManager();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: projectKeys.lists(),
    queryFn: async ({ pageParam = 1 }) => {
      const { projects, hasMore } = await projectManager.getAllProjectsPaginated(pageParam);
      return {
        projects,
        nextPage: hasMore ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage
  });

  if (status === 'loading') return <div>Loading projects...</div>;
  if (status === 'error') return <div>Error loading projects</div>;

  return (
    <div>
      {data.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </React.Fragment>
      ))}
      
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
          ? 'Load more'
          : 'No more projects'}
      </button>
    </div>
  );
}
```

### Project Details with Optimistic Updates

```typescript
// src/components/ProjectDetails.tsx
import { useProject, useUpdateProject } from '../hooks/queries/useProjectQueries';
import { useMilestones } from '../hooks/queries/useMilestoneQueries';

export function ProjectDetails({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const { data: project, isLoading } = useProject(projectId);
  const { data: milestones } = useProjectMilestones(projectId);
  
  const updateProject = useUpdateProject({
    // Optimistic update
    onMutate: async (newProject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(projectKeys.detail(projectId));

      // Save previous value
      const previousProject = queryClient.getQueryData(projectKeys.detail(projectId));

      // Optimistically update
      queryClient.setQueryData(projectKeys.detail(projectId), newProject);

      return { previousProject };
    },
    // If error, roll back
    onError: (err, newProject, context) => {
      queryClient.setQueryData(
        projectKeys.detail(projectId),
        context?.previousProject
      );
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const handleStatusChange = (newStatus: Project['status']) => {
    updateProject.mutate({
      ...project,
      status: newStatus
    });
  };

  return (
    <div>
      <h1>{project.name}</h1>
      <select
        value={project.status}
        onChange={(e) => handleStatusChange(e.target.value as Project['status'])}
      >
        <option value="active">Active</option>
        <option value="complete">Complete</option>
        <option value="archived">Archived</option>
      </select>

      <h2>Milestones</h2>
      {milestones?.map(milestone => (
        <MilestoneCard key={milestone.id} milestone={milestone} />
      ))}
    </div>
  );
}
```

## Advanced Features

### Prefetching

```typescript
// src/components/ProjectList.tsx
import { useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '../hooks/queries/useProjectQueries';

export function ProjectCard({ project }: { project: Project }) {
  const queryClient = useQueryClient();

  // Prefetch project details on hover
  const prefetchProject = () => {
    queryClient.prefetchQuery(
      projectKeys.detail(project.id),
      () => projectManager.getProject(project.id)
    );
  };

  return (
    <div onMouseEnter={prefetchProject}>
      {/* Project card content */}
    </div>
  );
}
```

### Parallel Queries

```typescript
// src/components/ProjectDashboard.tsx
import { useQueries } from '@tanstack/react-query';

export function ProjectDashboard({ projectIds }: { projectIds: string[] }) {
  const projectQueries = useQueries({
    queries: projectIds.map(id => ({
      queryKey: projectKeys.detail(id),
      queryFn: () => projectManager.getProject(id)
    }))
  });

  return (
    <div>
      {projectQueries.map(({ data: project, isLoading }) => {
        if (isLoading) return <div>Loading...</div>;
        if (!project) return null;
        return <ProjectCard key={project.id} project={project} />;
      })}
    </div>
  );
}
```

### Dependent Queries

```typescript
// src/components/ProjectResources.tsx
export function ProjectResources({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);
  
  const resourceQueries = useQueries({
    queries: project?.sourceResources.map(resourceId => ({
      queryKey: ['resources', resourceId],
      queryFn: () => projectManager.getResource(resourceId),
      enabled: !!project // Only run when project is loaded
    })) ?? []
  });

  return (
    <div>
      {resourceQueries.map(({ data: resource, isLoading }) => {
        if (isLoading) return <div>Loading...</div>;
        if (!resource) return null;
        return <ResourceCard key={resource.id} resource={resource} />;
      })}
    </div>
  );
}
```

### Error Handling with Suspense

```typescript
// src/components/ProjectListSuspense.tsx
import { Suspense } from 'react';
import { useProjects } from '../hooks/queries/useProjectQueries';

function ProjectListContent() {
  const { data: projects } = useProjects({
    suspense: true
  });

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export function ProjectList() {
  return (
    <Suspense fallback={<div>Loading projects...</div>}>
      <ProjectListContent />
    </Suspense>
  );
}
```

## Best Practices

1. **Query Keys**:
   - Use structured query keys for better organization
   - Keep query keys consistent across the application
   - Use query key factories for type safety

2. **Caching**:
   - Set appropriate staleTime and cacheTime for your data
   - Use optimistic updates for better UX
   - Implement proper cache invalidation

3. **Error Handling**:
   - Implement retry logic for failed queries
   - Show loading and error states
   - Use error boundaries for fallbacks

4. **Performance**:
   - Use infinite queries for large lists
   - Implement prefetching for better UX
   - Use suspense for loading states

5. **TypeScript**:
   - Define proper types for all queries and mutations
   - Use type inference where possible
   - Implement proper error typing

## Testing

Example of testing components with Tanstack Query:

```typescript
// src/components/__tests__/ProjectList.test.tsx
import { renderWithClient } from '../../test/utils';
import { ProjectList } from '../ProjectList';

describe('ProjectList', () => {
  it('renders projects', async () => {
    const { findByText } = renderWithClient(<ProjectList />);
    
    expect(await findByText('Test Project')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    const { getByText } = renderWithClient(<ProjectList />);
    
    expect(getByText('Loading projects...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock failed query
    server.use(
      rest.get('/api/projects', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { findByText } = renderWithClient(<ProjectList />);
    
    expect(await findByText('Error loading projects')).toBeInTheDocument();
  });
});
``` 