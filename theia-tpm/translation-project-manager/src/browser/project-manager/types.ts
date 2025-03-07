import type { Organization, Project, Milestone, Task, Resource, User, Team } from './models';

// Configuration interface
export interface ProjectManagerConfig {
  organizationId: string;
  token?: string;  // Made optional
  apiUrl?: string;
}

// Input types for creation
export interface CreateUserInput {
  type: 'user';
  name: string;
  email: string;
  organizationId: string;
}

export interface CreateTeamInput {
  type: 'team';
  name: string;
  organizationId: string;
  userIds: string[];
}

export interface CreateOrganizationInput {
  type: 'organization';
  name: string;
  teamIds?: string[]; // Optional during creation, can be added later
}

export interface CreateResourceInput {
  type: 'resource';
  name: string;
  path: string;
  organizationId: string;
  contentType: string;
  language: string;
  version?: string;
}

export interface CreateProjectInput {
  type: 'project';
  name: string;
  organizationId: string;
  teamId: string;
  sourceResources: string[]; // IDs of source resources used as input
  targetResources: string[]; // IDs of target resources being created/modified
  status?: 'active' | 'complete' | 'archived'; // Default is 'active' if not specified
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateMilestoneInput {
  type: 'milestone';
  name: string;
  projectId?: string;
  teamId: string;
  resourceScope: string[]; // Subset of project resource IDs that can be affected by this milestone
}

export interface CreateTaskInput {
  type: 'task';
  name: string;
  milestoneId: string;
  assignedUserIds: string[];
  resourceId: string; // ID of the single resource from milestone scope that this task affects
  status: 'open' | 'closed';
  description?: string;
}



export interface UpdateTeamInput {
  id: string;
  name?: string;
  description?: string;
  memberIds?: string[];
  leaderId?: string;
}

export interface IStorageService {
  // Database operations
  initialize(): Promise<void>;
  clearAllData(): Promise<void>;
  close(): Promise<void>;

  // User operations
  createUser(input: CreateUserInput): Promise<User>;
  getUser(id: string): Promise<User | null>;
  updateUser(user: User): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getUsersByOrganization(orgId: string): Promise<User[]>;
  getUsersByTeam(teamId: string): Promise<User[]>;

  // Team operations
  createTeam(input: CreateTeamInput): Promise<Team>;
  getTeam(id: string): Promise<Team | null>;
  updateTeam(input: UpdateTeamInput): Promise<Team>;
  deleteTeam(id: string): Promise<void>;
  getAllTeams(): Promise<Team[]>;
  getTeamsByOrganization(organizationId: string): Promise<Team[]>;
  
  // Organization operations
  createOrganization(input: CreateOrganizationInput): Promise<Organization>;
  getOrganization(id: string): Promise<Organization | null>;
  updateOrganization(org: Organization): Promise<Organization>;
  deleteOrganization(id: string): Promise<void>;
  getAllOrganizations(): Promise<Organization[]>;

  // Resource operations
  createResource(input: CreateResourceInput): Promise<Resource>;
  getResource(id: string): Promise<Resource | null>;
  updateResource(resource: Resource): Promise<Resource>;
  deleteResource(id: string): Promise<void>;
  getAllResources(): Promise<Resource[]>;
  getResourcesByOrganization(orgId: string): Promise<Resource[]>;

  // Project operations
  createProject(input: CreateProjectInput): Promise<Project>;
  getProject(id: string): Promise<Project | null>;
  updateProject(project: Project): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getAllProjects(): Promise<Project[]>;
  getProjectsByOrganization(orgId: string): Promise<Project[]>;
  getProjectsByTeam(teamId: string): Promise<Project[]>;

  // Milestone operations
  createMilestone(input: CreateMilestoneInput): Promise<Milestone>;
  getMilestone(id: string, projectId: string): Promise<Milestone | null>;
  updateMilestone(milestone: Milestone, projectId: string): Promise<Milestone>;
  deleteMilestone(id: string, projectId: string): Promise<void>;
  getAllMilestones(): Promise<Milestone[]>;
  getMilestonesByProject(projectId: string): Promise<Milestone[]>;
  getMilestonesByTeam(teamId: string): Promise<Milestone[]>;

  // Task operations
  createTask(input: CreateTaskInput, projectId: string): Promise<Task>;
  getTask(id: string, milestoneId: string, projectId: string): Promise<Task | null>;
  updateTask(task: Task, projectId: string): Promise<Task>;
  deleteTask(id: string, milestoneId: string, projectId: string): Promise<void>;
  getAllTasks(): Promise<Task[]>;
  getTasksByMilestone(milestoneId: string, projectId: string): Promise<Task[]>;
  getTasksByUser(userId: string): Promise<Task[]>;

  // User methods
  getUsersByOrganization(organizationId: string): Promise<User[]>;
  addUserToTeam(userId: string, teamId: string): Promise<void>;
  removeUserFromTeam(userId: string, teamId: string): Promise<void>;
  addUserToOrganization(userId: string, organizationId: string): Promise<void>;
}

export const TYPES = {
  StorageService: Symbol.for('StorageService'),
  ProjectManager: Symbol.for('ProjectManager'),
  OrganizationManager: Symbol.for('OrganizationManager'),
  UserManager: Symbol.for('UserManager'),
  Config: Symbol.for('Config')
}; 