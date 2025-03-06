# Project Manager API Documentation

## Table of Contents

- [Configuration](#configuration)
- [ProjectManager](#projectmanager)
- [DCSStorageService](#dcsstorageservice)
- [Types and Interfaces](#types-and-interfaces)

## Configuration

### `configureProjectManager(config: ProjectManagerConfig)`

Configures the project manager with organization and authentication details.

```typescript
interface ProjectManagerConfig {
  organizationId: string;
  token?: string;
  apiUrl?: string;
  debug?: boolean;
}
```

**Parameters:**
- `organizationId` (required): The organization identifier
- `token` (optional): Authentication token for DCS API access
- `apiUrl` (optional): Custom DCS API URL
- `debug` (optional): Enable debug mode

**Example:**
```typescript
configureProjectManager({
  organizationId: 'my-org',
  token: 'dcs-token',
  apiUrl: 'https://git.door43.org/api/v1'
});
```

### `getProjectManager()`

Returns the configured ProjectManager instance.

**Returns:** `ProjectManager`

## ProjectManager

### Project Operations

#### `async createProject(name: string, teamId: string, sourceResources: string[], targetResources: string[], description?: string, status?: 'active' | 'complete' | 'archived'): Promise<Project>`

Creates a new project.

**Parameters:**
- `name`: Project name
- `teamId`: ID of the team assigned to the project
- `sourceResources`: Array of source resource IDs
- `targetResources`: Array of target resource IDs
- `description` (optional): Project description
- `status` (optional): Project status (defaults to 'active')

**Returns:** Promise resolving to the created Project

**Example:**
```typescript
const project = await projectManager.createProject(
  'Translation Project',
  'team-123',
  ['source-1'],
  ['target-1'],
  'Project description'
);
```

#### `async getProject(id: string): Promise<Project | null>`

Retrieves a project by ID.

**Parameters:**
- `id`: Project ID

**Returns:** Promise resolving to the Project or null if not found

#### `async updateProject(project: Project): Promise<Project>`

Updates an existing project.

**Parameters:**
- `project`: Project object with updated fields

**Returns:** Promise resolving to the updated Project

#### `async getAllProjects(): Promise<Project[]>`

Retrieves all projects.

**Returns:** Promise resolving to an array of Projects

#### `async getProjectsByTeam(teamId: string): Promise<Project[]>`

Retrieves all projects assigned to a specific team.

**Parameters:**
- `teamId`: Team ID

**Returns:** Promise resolving to an array of Projects

### Milestone Operations

#### `async createMilestone(name: string, projectId: string, teamId: string, resourceScope: string[]): Promise<Milestone>`

Creates a new milestone.

**Parameters:**
- `name`: Milestone name
- `projectId`: ID of the parent project
- `teamId`: ID of the team assigned to the milestone
- `resourceScope`: Array of resource IDs in scope for this milestone

**Returns:** Promise resolving to the created Milestone

#### `async getMilestone(id: string): Promise<Milestone | null>`

Retrieves a milestone by ID.

**Parameters:**
- `id`: Milestone ID

**Returns:** Promise resolving to the Milestone or null if not found

#### `async updateMilestone(milestone: Milestone): Promise<Milestone>`

Updates an existing milestone.

**Parameters:**
- `milestone`: Milestone object with updated fields

**Returns:** Promise resolving to the updated Milestone

### Task Operations

#### `async createTask(name: string, milestoneId: string, resourceId: string, assignedUserIds?: string[], description?: string): Promise<Task>`

Creates a new task.

**Parameters:**
- `name`: Task name
- `milestoneId`: ID of the parent milestone
- `resourceId`: ID of the resource this task affects
- `assignedUserIds` (optional): Array of user IDs assigned to the task
- `description` (optional): Task description

**Returns:** Promise resolving to the created Task

#### `async getTask(id: string): Promise<Task | null>`

Retrieves a task by ID.

**Parameters:**
- `id`: Task ID

**Returns:** Promise resolving to the Task or null if not found

#### `async updateTask(task: Task): Promise<Task>`

Updates an existing task.

**Parameters:**
- `task`: Task object with updated fields

**Returns:** Promise resolving to the updated Task

## DCSStorageService

### Configuration

#### `setConfig(config: DCSConfig): void`

Configures the DCS storage service.

```typescript
interface DCSConfig {
  token?: string;
  apiUrl: string;
  organizationId?: string;
}
```

### Resource Operations

#### `async createResource(input: CreateResourceInput): Promise<Resource>`

Creates a new resource in DCS.

**Parameters:**
```typescript
interface CreateResourceInput {
  type: 'resource';
  name: string;
  organizationId: string;
  path: string;
  contentType: string;
  language: string;
  version?: string;
}
```

**Returns:** Promise resolving to the created Resource

#### `async getResource(id: string): Promise<Resource | null>`

Retrieves a resource by ID.

**Parameters:**
- `id`: Resource ID

**Returns:** Promise resolving to the Resource or null if not found

## Types and Interfaces

### Project

```typescript
interface Project {
  id: string;
  type: 'project';
  name: string;
  organizationId: string;
  teamId: string;
  sourceResources: string[];
  targetResources: string[];
  status: 'active' | 'complete' | 'archived';
  description?: string;
}
```

### Milestone

```typescript
interface Milestone {
  id: string;
  type: 'milestone';
  name: string;
  projectId: string;
  teamId: string;
  resourceScope: string[];
}
```

### Task

```typescript
interface Task {
  id: string;
  type: 'task';
  name: string;
  milestoneId: string;
  assignedUserIds: string[];
  resourceId: string;
  status: 'open' | 'closed';
  description?: string;
}
```

### Resource

```typescript
interface Resource {
  id: string;
  type: 'resource';
  name: string;
  path: string;
  organizationId: string;
  contentType: string;
  language: string;
  version?: string;
}
```

## Error Handling

The API methods may throw the following types of errors:

### `DCSError`

Base error class for DCS-related errors.

```typescript
class DCSError extends Error {
  constructor(message: string, public code: string);
}
```

Common error codes:
- `ORGANIZATION_NOT_FOUND`
- `INVALID_TOKEN`
- `RESOURCE_NOT_FOUND`
- `PERMISSION_DENIED`
- `CONCURRENT_UPDATE`

### Error Handling Example

```typescript
try {
  await projectManager.createProject(/* ... */);
} catch (error) {
  if (error instanceof DCSError) {
    switch (error.code) {
      case 'ORGANIZATION_NOT_FOUND':
        // Handle organization not found
        break;
      case 'PERMISSION_DENIED':
        // Handle permission denied
        break;
      default:
        // Handle other DCS errors
    }
  } else {
    // Handle other errors
  }
}
```

## Pagination

Some methods support pagination for large result sets:

### `async getAllProjects(page?: number, pageSize?: number): Promise<{ projects: Project[]; hasMore: boolean }>`

**Parameters:**
- `page` (optional): Page number (1-based)
- `pageSize` (optional): Number of items per page

**Returns:**
```typescript
interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  total?: number;
}
```

## Events

The ProjectManager emits events that you can subscribe to:

```typescript
projectManager.on('projectCreated', (project: Project) => {
  // Handle project created
});

projectManager.on('projectUpdated', (project: Project) => {
  // Handle project updated
});

projectManager.on('projectDeleted', (projectId: string) => {
  // Handle project deleted
});
```

## Rate Limiting

The DCSStorageService implements rate limiting to prevent API abuse:

- Maximum 5000 requests per hour per token
- Maximum 60 requests per minute for unauthenticated requests

When rate limits are exceeded, the service will throw a `DCSError` with code `RATE_LIMIT_EXCEEDED`. 