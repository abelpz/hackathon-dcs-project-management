# Using ProjectManager in a React Application

This tutorial demonstrates how to integrate and use the ProjectManager with DCSStorageService in a React application.

## Setup

### 1. Installation

First, install the required dependencies:

```bash
npm install @core/project-manager inversify
```

### 2. Project Configuration

Create a configuration file `src/config/projectManager.ts`:

```typescript
import { configureProjectManager, getProjectManager } from '@core/project-manager';
import { DCSStorageService } from '@core/project-manager/storage/DCSStorageService';
import { TYPES } from '@core/project-manager/types';
import { container } from '@core/project-manager/container';

// Configure DCSStorageService
container.bind(TYPES.StorageService).to(DCSStorageService).inSingletonScope();

// Initialize with default config
configureProjectManager({
  organizationId: process.env.REACT_APP_DCS_ORGANIZATION_ID || '',
  token: process.env.REACT_APP_DCS_TOKEN,
  apiUrl: process.env.REACT_APP_DCS_API_URL || 'https://git.door43.org/api/v1'
});

// Export configured instance
export const projectManager = getProjectManager();
```

### 3. React Context Setup

Create a ProjectManager context to make it available throughout your app:

```typescript
// src/contexts/ProjectManagerContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { ProjectManager } from '@core/project-manager';
import { projectManager } from '../config/projectManager';

const ProjectManagerContext = createContext<ProjectManager | null>(null);

export function ProjectManagerProvider({ children }: { children: ReactNode }) {
  return (
    <ProjectManagerContext.Provider value={projectManager}>
      {children}
    </ProjectManagerContext.Provider>
  );
}

export function useProjectManager() {
  const context = useContext(ProjectManagerContext);
  if (!context) {
    throw new Error('useProjectManager must be used within a ProjectManagerProvider');
  }
  return context;
}
```

### 4. Add Provider to App

Wrap your app with the ProjectManagerProvider:

```typescript
// src/App.tsx
import { ProjectManagerProvider } from './contexts/ProjectManagerContext';

function App() {
  return (
    <ProjectManagerProvider>
      {/* Your app components */}
    </ProjectManagerProvider>
  );
}
```

## Custom Hooks

Create reusable hooks for common operations:

```typescript
// src/hooks/useProjects.ts
import { useState, useEffect } from 'react';
import { Project } from '@core/project-manager/models';
import { useProjectManager } from '../contexts/ProjectManagerContext';

export function useProjects() {
  const projectManager = useProjectManager();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await projectManager.getAllProjects();
        setProjects(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [projectManager]);

  return { projects, loading, error };
}

// src/hooks/useProject.ts
export function useProject(projectId: string) {
  const projectManager = useProjectManager();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await projectManager.getProject(projectId);
        setProject(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectManager, projectId]);

  return { project, loading, error };
}
```

## Example Components

### Project List Component

```typescript
// src/components/ProjectList.tsx
import React from 'react';
import { useProjects } from '../hooks/useProjects';

export function ProjectList() {
  const { projects, loading, error } = useProjects();

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Projects</h2>
      <div className="project-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="project-status">
              Status: {project.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Project Creation Form

```typescript
// src/components/CreateProjectForm.tsx
import React, { useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';

export function CreateProjectForm() {
  const projectManager = useProjectManager();
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [sourceResources, setSourceResources] = useState<string[]>([]);
  const [targetResources, setTargetResources] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const project = await projectManager.createProject(
        name,
        teamId,
        sourceResources,
        targetResources,
        description
      );
      console.log('Created project:', project);
      // Reset form or redirect
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Project Name:</label>
        <input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      {/* Add other form fields */}
      <button type="submit">Create Project</button>
    </form>
  );
}
```

### Project Details Component

```typescript
// src/components/ProjectDetails.tsx
import React from 'react';
import { useProject } from '../hooks/useProject';
import { useProjectManager } from '../contexts/ProjectManagerContext';

interface ProjectDetailsProps {
  projectId: string;
}

export function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const { project, loading, error } = useProject(projectId);
  const projectManager = useProjectManager();

  if (loading) return <div>Loading project details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!project) return <div>Project not found</div>;

  const handleStatusChange = async (newStatus: 'active' | 'complete' | 'archived') => {
    try {
      const updatedProject = await projectManager.updateProject({
        ...project,
        status: newStatus
      });
      console.log('Updated project:', updatedProject);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  return (
    <div className="project-details">
      <h2>{project.name}</h2>
      <p>{project.description}</p>
      
      <div className="status-controls">
        <select
          value={project.status}
          onChange={e => handleStatusChange(e.target.value as any)}
        >
          <option value="active">Active</option>
          <option value="complete">Complete</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="resources">
        <h3>Source Resources</h3>
        <ul>
          {project.sourceResources.map(resource => (
            <li key={resource}>{resource}</li>
          ))}
        </ul>

        <h3>Target Resources</h3>
        <ul>
          {project.targetResources.map(resource => (
            <li key={resource}>{resource}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## Error Boundary

Create an error boundary to handle ProjectManager errors:

```typescript
// src/components/ProjectManagerErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { DCSError } from '@core/project-manager/errors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ProjectManagerErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ProjectManager error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.state.error instanceof DCSError) {
        return (
          <div className="error-message">
            <h2>DCS Error</h2>
            <p>{this.state.error.message}</p>
            {/* Add retry or recovery options */}
          </div>
        );
      }

      return (
        <div className="error-message">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Usage in Routes

Example of using components in routes:

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectManagerProvider } from './contexts/ProjectManagerContext';
import { ProjectManagerErrorBoundary } from './components/ProjectManagerErrorBoundary';
import { ProjectList } from './components/ProjectList';
import { ProjectDetails } from './components/ProjectDetails';
import { CreateProjectForm } from './components/CreateProjectForm';

function App() {
  return (
    <ProjectManagerProvider>
      <ProjectManagerErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/new" element={<CreateProjectForm />} />
            <Route path="/projects/:id" element={
              <ProjectDetails projectId={useParams().id || ''} />
            } />
          </Routes>
        </BrowserRouter>
      </ProjectManagerErrorBoundary>
    </ProjectManagerProvider>
  );
}
```

## Best Practices

1. **State Management**:
   - Use React Query or SWR for caching and automatic revalidation
   - Implement optimistic updates for better UX
   - Use context selectively to avoid unnecessary re-renders

2. **Error Handling**:
   - Implement retry logic for failed requests
   - Show user-friendly error messages
   - Log errors to a monitoring service

3. **Performance**:
   - Implement pagination for large lists
   - Use React.memo for expensive components
   - Debounce frequent API calls

4. **Security**:
   - Store sensitive tokens in environment variables
   - Implement proper authentication flow
   - Validate user permissions before operations

## Example with React Query

Here's how to use ProjectManager with React Query for better data management:

```typescript
// src/hooks/useProjectsQuery.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useProjectManager } from '../contexts/ProjectManagerContext';

export function useProjectsQuery() {
  const projectManager = useProjectManager();

  return useQuery('projects', () => projectManager.getAllProjects());
}

export function useCreateProjectMutation() {
  const projectManager = useProjectManager();
  const queryClient = useQueryClient();

  return useMutation(
    (projectData: CreateProjectInput) => projectManager.createProject(
      projectData.name,
      projectData.teamId,
      projectData.sourceResources,
      projectData.targetResources,
      projectData.description
    ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
      }
    }
  );
}
```

## Testing

Example of testing a component that uses ProjectManager:

```typescript
// src/components/__tests__/ProjectList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { ProjectManagerProvider } from '../../contexts/ProjectManagerContext';
import { ProjectList } from '../ProjectList';

// Mock the project manager
jest.mock('../../config/projectManager', () => ({
  projectManager: {
    getAllProjects: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Test Project',
        status: 'active'
      }
    ])
  }
}));

describe('ProjectList', () => {
  it('renders projects', async () => {
    render(
      <ProjectManagerProvider>
        <ProjectList />
      </ProjectManagerProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });
}); 