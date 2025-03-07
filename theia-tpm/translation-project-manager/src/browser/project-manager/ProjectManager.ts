import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import type { IStorageService, CreateProjectInput, CreateMilestoneInput, CreateTaskInput, ProjectManagerConfig } from './types';
import type { Project, Milestone, Task } from './models';

@injectable()
export class ProjectManager {
  private config: ProjectManagerConfig;
  
  constructor(
    @inject(TYPES.StorageService) private storageService: IStorageService,
    @inject(TYPES.Config) config: ProjectManagerConfig
  ) {
    this.config = config;
  }

  // Return the current organization ID
  get organizationId(): string {
    return this.config.organizationId;
  }

  // Return the current auth token
  get token(): string {
    return this.config.token || '';
  }

  // Update the configuration
  updateConfig(config: Partial<ProjectManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Initialization
  async initialize(): Promise<void> {
    await this.storageService.initialize();
  }

  // Project Management
  async createProject(
    name: string, 
    teamId: string,
    sourceResources: string[], 
    targetResources: string[], 
    description?: string,
    status: 'active' | 'complete' | 'archived' = 'active'
  ): Promise<Project> {
    const input: CreateProjectInput = {
      type: 'project',
      name,
      organizationId: this.config.organizationId,
      teamId,
      sourceResources,
      targetResources,
      status,
      description
    };
    return this.storageService.createProject(input);
  }

  async getProject(id: string): Promise<Project | null> {
    return this.storageService.getProject(id);
  }

  async updateProject(project: Project): Promise<Project> {
    return this.storageService.updateProject(project);
  }

  async addResourcesToProject(
    projectId: string,
    sourceResources: string[] = [],
    targetResources: string[] = []
  ): Promise<Project> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    // Add new resources, avoiding duplicates
    const updatedProject: Project = {
      ...project,
      sourceResources: [...new Set([...project.sourceResources, ...sourceResources])],
      targetResources: [...new Set([...project.targetResources, ...targetResources])]
    };

    return this.updateProject(updatedProject);
  }

  async deleteProject(id: string): Promise<void> {
    // First, delete all related milestones
    const milestones = await this.getMilestonesByProject(id);
    await Promise.all(milestones.map(milestone => this.deleteMilestone(milestone.id)));
    
    // Then delete the project
    await this.storageService.deleteProject(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return this.storageService.getAllProjects();
  }

  async getProjectsByOrganization(orgId?: string): Promise<Project[]> {
    return this.storageService.getProjectsByOrganization(orgId || this.config.organizationId);
  }

  async getProjectsByTeam(teamId: string): Promise<Project[]> {
    return this.storageService.getProjectsByTeam(teamId);
  }

  async getCurrentOrganizationProjects(): Promise<Project[]> {
    return this.getProjectsByOrganization();
  }

  // Milestone Management
  async createMilestone(
    name: string, 
    projectId: string, 
    teamId: string,
    resourceScope: string[]
  ): Promise<Milestone> {
    const input: CreateMilestoneInput = {
      type: 'milestone',
      name,
      projectId,
      teamId,
      resourceScope
    };
    return this.storageService.createMilestone(input);
  }

  async getMilestone(id: string): Promise<Milestone | null> {
    return this.storageService.getMilestone(id);
  }

  async updateMilestone(milestone: Milestone): Promise<Milestone> {
    return this.storageService.updateMilestone(milestone);
  }

  async deleteMilestone(id: string): Promise<void> {
    // First, delete all related tasks
    const tasks = await this.getTasksByMilestone(id);
    await Promise.all(tasks.map(task => this.deleteTask(task.id, id)));
    
    // Then delete the milestone
    await this.storageService.deleteMilestone(id);
  }

  async getAllMilestones(): Promise<Milestone[]> {
    return this.storageService.getAllMilestones();
  }

  async getMilestonesByProject(projectId: string): Promise<Milestone[]> {
    return this.storageService.getMilestonesByProject(projectId);
  }

  async getMilestonesByTeam(teamId: string): Promise<Milestone[]> {
    return this.storageService.getMilestonesByTeam(teamId);
  }

  // Task Management
  async createTask(
    name: string, 
    milestoneId: string, 
    resourceId: string,
    assignedUserIds: string[] = [],
    description?: string
  ): Promise<Task> {
    const input: CreateTaskInput = {
      type: 'task',
      name,
      milestoneId,
      resourceId,
      assignedUserIds,
      status: 'open',
      description
    };
    return this.storageService.createTask(input);
  }

  async getTask(id: string, milestoneId: string): Promise<Task | null> {
    return this.storageService.getTask(id, milestoneId);
  }

  async updateTask(task: Task, milestoneId: string): Promise<Task> {
    return this.storageService.updateTask(task, milestoneId);
  }

  async deleteTask(id: string, milestoneId: string): Promise<void> {
    await this.storageService.deleteTask(id, milestoneId);
  }

  async getAllTasks(): Promise<Task[]> {
    return this.storageService.getAllTasks();
  }

  async getTasksByMilestone(milestoneId: string): Promise<Task[]> {
    return this.storageService.getTasksByMilestone(milestoneId);
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return this.storageService.getTasksByUser(userId);
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await this.storageService.clearAllData();
  }

  async close(): Promise<void> {
    await this.storageService.close();
  }
} 