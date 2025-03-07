# Using ProjectManager with DCSStorageService Tutorial

This tutorial demonstrates how to use the ProjectManager with DCSStorageService to manage projects, milestones, and tasks in your application.

## Setup and Initialization

First, you need to configure and initialize the ProjectManager with DCSStorageService:

```typescript
import { configureProjectManager, getProjectManager } from '@core/project-manager';
import { DCSStorageService } from '@core/project-manager/storage/DCSStorageService';
import { TYPES } from '@core/project-manager/types';
import { container } from '@core/project-manager/container';

// Configure DCSStorageService
container.bind(TYPES.StorageService).to(DCSStorageService).inSingletonScope();

// Configure ProjectManager with your organization details
configureProjectManager({
  organizationId: 'your-organization-id',
  token: 'your-dcs-token', // Optional: Required for DCS API access
  apiUrl: 'https://git.door43.org/api/v1' // Optional: DCS API URL
});

// Get ProjectManager instance
const projectManager = getProjectManager();

// Initialize
await projectManager.initialize();
```

## Project Management

### Creating a Project

```typescript
const project = await projectManager.createProject(
  'My Translation Project', // name
  'team-123', // teamId
  ['source-resource-1', 'source-resource-2'], // sourceResources
  ['target-resource-1'], // targetResources
  'Project description', // optional description
  'active' // optional status
);

console.log('Created project:', project);
```

### Getting and Updating Projects

```typescript
// Get a specific project
const project = await projectManager.getProject('project-123');

// Update project
if (project) {
  project.status = 'complete';
  const updatedProject = await projectManager.updateProject(project);
  console.log('Updated project:', updatedProject);
}

// Get all projects
const allProjects = await projectManager.getAllProjects();

// Get projects by team
const teamProjects = await projectManager.getProjectsByTeam('team-123');

// Get projects for current organization
const orgProjects = await projectManager.getCurrentOrganizationProjects();
```

## Milestone Management

### Creating a Milestone

```typescript
const milestone = await projectManager.createMilestone(
  'Phase 1', // name
  'project-123', // projectId
  'team-123', // teamId
  ['resource-1', 'resource-2'] // resourceScope
);

console.log('Created milestone:', milestone);
```

### Getting and Updating Milestones

```typescript
// Get a specific milestone
const milestone = await projectManager.getMilestone('milestone-123');

// Update milestone
if (milestone) {
  milestone.name = 'Phase 1 - Review';
  const updatedMilestone = await projectManager.updateMilestone(milestone);
  console.log('Updated milestone:', updatedMilestone);
}
```

## Task Management

### Creating a Task

```typescript
const task = await projectManager.createTask(
  'Review Chapter 1', // name
  'milestone-123', // milestoneId
  'resource-1', // resourceId
  ['user-1', 'user-2'], // assignedUserIds
  'Review translation of Chapter 1' // optional description
);

console.log('Created task:', task);
```

### Getting and Updating Tasks

```typescript
// Get a specific task
const task = await projectManager.getTask('task-123');

// Update task
if (task) {
  task.status = 'closed';
  const updatedTask = await projectManager.updateTask(task);
  console.log('Updated task:', updatedTask);
}

// Get all tasks
const allTasks = await projectManager.getAllTasks();
```

## Error Handling

The ProjectManager includes built-in error handling. Here's how to handle potential errors:

```typescript
try {
  const project = await projectManager.createProject(
    'My Project',
    'team-123',
    ['source-1'],
    ['target-1']
  );
} catch (error) {
  if (error.message.includes('organization')) {
    console.error('Organization-related error:', error);
  } else if (error.message.includes('permission')) {
    console.error('Permission error:', error);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Best Practices

1. **Initialization**: Always initialize the ProjectManager before using it:
   ```typescript
   await projectManager.initialize();
   ```

2. **Organization ID**: Make sure to configure the organization ID before performing any operations:
   ```typescript
   configureProjectManager({
     organizationId: 'your-organization-id'
   });
   ```

3. **Resource Management**: When creating projects, ensure that:
   - Source resources exist and are accessible
   - Target resources are properly specified
   - Team has appropriate permissions

4. **Concurrency**: The DCSStorageService handles concurrent updates automatically, but it's good practice to:
   - Fetch latest data before updates
   - Handle potential conflicts in your application logic

5. **Error Handling**: Always wrap operations in try-catch blocks to handle potential errors gracefully

## Common Patterns

### Creating a Complete Project Structure

Here's an example of creating a project with milestones and tasks:

```typescript
async function createProjectStructure(
  projectName: string,
  teamId: string,
  sourceResources: string[],
  targetResources: string[]
) {
  // Create project
  const project = await projectManager.createProject(
    projectName,
    teamId,
    sourceResources,
    targetResources
  );

  // Create milestones
  const milestone1 = await projectManager.createMilestone(
    'Translation',
    project.id,
    teamId,
    targetResources
  );

  const milestone2 = await projectManager.createMilestone(
    'Review',
    project.id,
    teamId,
    targetResources
  );

  // Create tasks for each milestone
  await projectManager.createTask(
    'Initial Translation',
    milestone1.id,
    targetResources[0],
    ['translator-1', 'translator-2']
  );

  await projectManager.createTask(
    'Review Translation',
    milestone2.id,
    targetResources[0],
    ['reviewer-1']
  );

  return project;
}
```

### Monitoring Project Progress

```typescript
async function getProjectProgress(projectId: string) {
  const project = await projectManager.getProject(projectId);
  if (!project) return null;

  const milestones = await projectManager.getMilestonesByProject(projectId);
  const tasks = await projectManager.getAllTasks();

  const projectTasks = tasks.filter(task => 
    milestones.some(m => m.id === task.milestoneId)
  );

  const completedTasks = projectTasks.filter(task => task.status === 'closed');

  return {
    project,
    totalMilestones: milestones.length,
    totalTasks: projectTasks.length,
    completedTasks: completedTasks.length,
    progress: (completedTasks.length / projectTasks.length) * 100
  };
}
```

## Troubleshooting

### Common Issues and Solutions

1. **Organization ID Not Set**
   ```typescript
   // Fix: Configure organization ID before operations
   configureProjectManager({
     organizationId: 'your-organization-id'
   });
   ```

2. **Authentication Issues**
   ```typescript
   // Fix: Ensure token is provided and valid
   configureProjectManager({
     organizationId: 'your-organization-id',
     token: 'your-valid-token'
   });
   ```

3. **Resource Not Found**
   ```typescript
   // Fix: Verify resource exists before using
   const resource = await projectManager.storageService.getResource(resourceId);
   if (!resource) {
     throw new Error(`Resource ${resourceId} not found`);
   }
   ```

### Debug Mode

To enable debug mode for more detailed logging:

```typescript
configureProjectManager({
  organizationId: 'your-organization-id',
  debug: true // Enables detailed logging
});
```

## Next Steps

- Explore the API documentation for more advanced features
- Implement error handling specific to your application needs
- Add monitoring and logging for production use
- Consider implementing caching for frequently accessed data 