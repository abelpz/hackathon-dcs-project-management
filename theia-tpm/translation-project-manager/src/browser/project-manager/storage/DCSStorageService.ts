import { injectable } from 'inversify';
import type {
  IStorageService,
  CreateOrganizationInput,
  CreateUserInput,
  CreateTeamInput,
  CreateProjectInput,
  CreateMilestoneInput,
  CreateTaskInput,
  CreateResourceInput
} from '../types';
import type {
  Organization,
  Project,
  Milestone,
  Task,
  Resource,
  User,
  Team
} from '../models';
import axios, { AxiosInstance } from 'axios';

// Extended types to match our usage
interface ExtendedProject extends Project {
  data?: {
    content: string;
  };
  content?: string;
}

// DCS API Types
interface DCSUser {
  id: number;
  login: string;
  full_name: string;
  email: string;
  avatar_url: string;
  username: string;
}

interface DCSIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  milestone?: {
    id: number;
  };
  assignees: {
    id: number;
  }[];
}

interface DCSRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  owner: {
    id: number;
    login: string;
  };
}

interface DCSFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

interface DCSMilestoneMapping {
  repoName: string;
  milestoneId: string;
}

interface ProjectList {
  projects: {
    id: string;
    name: string;
    status: string;
  }[];
  lastUpdated: string;
}

interface DCSConfig {
  token?: string;
  apiUrl: string;
  organizationId?: string;
}

interface DCSMetadata {
  [key: string]: unknown;
}

interface ProcessedProjectMilestone {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  status: 'open' | 'closed';
  resources: string[];
  teamId: string;
  dcsMapping: DCSMilestoneMapping[];
}

interface ProcessedProjectData extends DCSMetadata {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'complete' | 'archived';
  teamId: string;
  sourceResources: string[];
  targetResources: string[];
  milestones: ProcessedProjectMilestone[];
}

// Add type for valid project statuses
type ProjectStatus = 'active' | 'completed' | 'archived';

const VALID_PROJECT_STATUSES: ProjectStatus[] = ['active', 'completed', 'archived'];

@injectable()
export class DCSStorageService implements IStorageService {
  private config: DCSConfig = {
    apiUrl: 'https://git.door43.org/api/v1'
  };
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  setConfig(config: Partial<DCSConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update axios client with new config
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(this.config.token && { 'Authorization': `token ${this.config.token}` })
      }
    });
  }

  private validateOrganizationId(): void {
    if (!this.config.organizationId) {
      throw new Error('Organization ID is required but not set. Please call setConfig with an organizationId.');
    }
  }

  async initialize(): Promise<void> {
    if (this.config.token) {
      try {
        // Test the token by making a simple API call
        await this.client.get('/user');

        // Ensure project-management repository exists
        try {
          await this.client.get(`/repos/${this.config.organizationId}/project-management`);
          
          // Repository exists, now check if project-list.json exists
          try {
            await this.client.get(`/repos/${this.config.organizationId}/project-management/contents/projects/project-list.json`);
          } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
              // project-list.json doesn't exist, create it
              this.validateOrganizationId();
              await this.storeMetadata(
                this.config.organizationId!,
                'project-management',
                { projects: [], lastUpdated: new Date().toISOString() },
                'projects/project-list.json'
              );
            } else {
              throw error;
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Create project-management repository if it doesn't exist
            await this.client.post(`/org/${this.config.organizationId}/repos`, {
              name: 'project-management',
              description: 'Project Management metadata repository',
              private: true
            });

            // Create initial project list
            this.validateOrganizationId();
            await this.storeMetadata(
              this.config.organizationId!,
              'project-management',
              { projects: [], lastUpdated: new Date().toISOString() },
              'projects/project-list.json'
            );
          } else {
            throw error;
          }
        }
      } catch (error) {
        throw new Error('Failed to initialize DCS storage service: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  }

  async clearAllData(): Promise<void> {
    // Not implemented for DCS - would be dangerous to allow clearing all data
    throw new Error('Clear all data operation not supported for DCS storage');
  }

  async close(): Promise<void> {
    // No specific cleanup needed for HTTP client
  }

  // Helper method to handle API errors
  private handleApiError(error: unknown, operation: string): never {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`DCS ${operation} failed: ${message}`);
    }
    throw error as Error;
  }

  // Helper method to parse base64 content
  private parseBase64Content<T>(content: string): T {
    try {
      const decodedContent = atob(content);
      return JSON.parse(decodedContent) as T;
    } catch (error) {
      throw new Error(`Failed to parse base64 content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to convert content to base64
  private toBase64Content(content: unknown): string {
    try {
      const jsonString = JSON.stringify(content, null, 2);
      return btoa(jsonString);
    } catch (error) {
      throw new Error(`Failed to convert content to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add retry helper at the top of the class
  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          // Conflict error, wait and retry
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        throw error;
      }
    }
    throw lastError || new Error('Operation failed after max retries');
  }

  // Update the storeMetadata method to use browser-compatible base64 encoding
  private async storeMetadata(orgName: string, repoName: string, metadata: DCSMetadata, path: string = 'metadata.json'): Promise<void> {
    await this.retryOperation(async () => {
      try {
        const content = this.toBase64Content(metadata);
        
        // Try to get existing file first
        try {
          const { data: existingFile } = await this.client.get(`/repos/${orgName}/${repoName}/contents/${path}`);
          
          // Update existing file
          await this.client.put(`/repos/${orgName}/${repoName}/contents/${path}`, {
            message: 'Update metadata',
            content,
            sha: existingFile.sha
          });
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            // File doesn't exist, create it
            await this.client.post(`/repos/${orgName}/${repoName}/contents/${path}`, {
              message: 'Create metadata',
              content
            });
          } else {
            throw error;
          }
        }
      } catch (error) {
        this.handleApiError(error, 'metadata storage');
      }
    });
  }

  // Helper method to read metadata from a repository
  private async readMetadata<T>(orgName: string, repoName: string, path: string = 'metadata.json'): Promise<T | null> {
    try {
      const { data: file } = await this.client.get(`/repos/${orgName}/${repoName}/contents/${path}`);
      const content = atob(file.content);
      return JSON.parse(content) as T;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, 'metadata retrieval');
    }
  }

  // Organization operations
  async createOrganization(input: CreateOrganizationInput): Promise<Organization> {
    try {
      // Create organization in DCS
      const { data: dcsOrg } = await this.client.post('/orgs', {
        username: input.name,
        full_name: input.name,
        description: `Organization for ${input.name}`
      });

      // Create metadata repository for the organization
      await this.client.post(`/org/${dcsOrg.username}/repos`, {
        name: '.project-manager',
        description: 'Project Manager metadata',
        private: true
      });

      // Store organization metadata
      const organization: Organization = {
        id: dcsOrg.id.toString(),
        type: 'organization',
        name: dcsOrg.username
      };

      await this.storeMetadata(
        dcsOrg.username,
        '.project-manager',
        organization as unknown as DCSMetadata
      );

      return organization;
    } catch (error) {
      this.handleApiError(error, 'organization creation');
    }
  }

  async getOrganization(id: string): Promise<Organization | null> {
    try {
      // First try to get the organization from DCS
      const { data: dcsOrg } = await this.client.get(`/organizations/${id}`);
      
      // Then get our metadata
      const metadata = await this.readMetadata<Organization>(
        dcsOrg.username,
        '.project-manager'
      );

      if (!metadata) {
        // Create basic metadata if it doesn't exist
        const organization: Organization = {
          id: dcsOrg.id.toString(),
          type: 'organization',
          name: dcsOrg.username
        };

        await this.storeMetadata(
          dcsOrg.username,
          '.project-manager',
          organization as unknown as DCSMetadata
        );

        return organization;
      }

      return metadata;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, 'organization retrieval');
    }
  }

  async updateOrganization(org: Organization): Promise<Organization> {
    try {
      // Update organization in DCS
      await this.client.patch(`/orgs/${org.name}`, {
        full_name: org.name,
        description: `Organization for ${org.name}`
      });

      // Update metadata
      await this.storeMetadata(
        org.name,
        '.project-manager',
        org as unknown as DCSMetadata
      );

      return org;
    } catch (error) {
      this.handleApiError(error, 'organization update');
    }
  }

  async deleteOrganization(id: string): Promise<void> {
    try {
      const org = await this.getOrganization(id);
      if (!org) return;

      // Delete organization in DCS
      await this.client.delete(`/orgs/${org.name}`);
    } catch (error) {
      this.handleApiError(error, 'organization deletion');
    }
  }

  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const { data: dcsOrgs } = await this.client.get('/user/orgs');
      const organizations: Organization[] = [];

      for (const dcsOrg of dcsOrgs) {
        const org = await this.getOrganization(dcsOrg.id.toString());
        if (org) {
          organizations.push(org);
        }
      }

      return organizations;
    } catch (error) {
      this.handleApiError(error, 'organizations retrieval');
    }
  }

  // User operations
  async createUser(input: CreateUserInput): Promise<User> {
    try {
      // Note: We can't create users in DCS, they must register themselves
      // Instead, we'll verify the user exists and map them to our domain model
      const { data: dcsUser } = await this.client.get(`/users/${input.name}`);

      // Map DCS user to our domain model
      return {
        id: dcsUser.id.toString(),
        name: dcsUser.full_name || dcsUser.login,
        email: dcsUser.email || input.email,
        organizationId: input.organizationId,
        avatarUrl: dcsUser.avatar_url
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`User ${input.name} not found in DCS. Users must register in DCS before they can be added to the system.`);
      }
      this.handleApiError(error, 'user creation');
    }
  }

  async getUser(id: string): Promise<User | null> {
    try {
      // Try to get user directly from DCS
      const { data: dcsUser } = await this.client.get(`/users/${id}`);
      
      if (dcsUser) {
        return {
          id: dcsUser.id.toString(),
          name: dcsUser.login_name,
          email: dcsUser.email,
          organizationId: this.config.organizationId || 'default',
          avatarUrl: dcsUser.avatar_url
        };
      }

      return null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, 'user retrieval');
    }
  }

  async updateUser(user: User): Promise<User> {
    try {
      // We can't update user details in DCS, they must do that themselves
      // Just verify the user exists and return fresh data
      const { data: dcsUser } = await this.client.get(`/users/${user.id}`);
      
      return {
        id: dcsUser.id.toString(),
        name: dcsUser.full_name || dcsUser.login,
        email: dcsUser.email,
        organizationId: user.organizationId,
        avatarUrl: dcsUser.avatar_url
      };
    } catch (error) {
      this.handleApiError(error, 'user update');
    }
  }

  async deleteUser(): Promise<void> {
    // We can't delete users from DCS, they must do that themselves
    // This is a no-op since we don't store any user metadata
  }

  async getAllUsers(): Promise<User[]> {
    try {
      // Get all users from the organization
      const { data: dcsUsers } = await this.client.get<DCSUser[]>(`/orgs/${this.config.organizationId}/members`);
      
      return dcsUsers.map(dcsUser => ({
        id: dcsUser.id.toString(),
        type: 'user',
        name: dcsUser.full_name || dcsUser.login,
        email: dcsUser.email,
        organizationId: this.config.organizationId || 'default',
        avatarUrl: dcsUser.avatar_url
      }));
    } catch (error) {
      this.handleApiError(error, 'users retrieval');
    }
  }

  async getUsersByOrganization(orgId: string): Promise<User[]> {
    try {
      const org = await this.getOrganization(orgId);
      if (!org) {
        return [];
      }

      // Get organization members from DCS API
      const { data: dcsMembers } = await this.client.get<DCSUser[]>(`/orgs/${org.name}/members`);
      
      // Map DCS members to our domain model
      return dcsMembers.map((member: DCSUser) => ({
        id: member.id.toString(),
        type: 'user',
        name: member.full_name || member.login,
        email: member.email,
        organizationId: orgId,
        avatarUrl: member.avatar_url
      }));
    } catch (error) {
      this.handleApiError(error, 'organization users retrieval');
    }
  }

  async getUsersByTeam(teamId: string): Promise<User[]> {
    try {
      // Get team members directly from DCS API
      const { data: dcsMembers } = await this.client.get<DCSUser[]>(`/teams/${teamId}/members`);
      
      return dcsMembers.map(member => ({
        id: member.id.toString(),
        type: 'user',
        name: member.full_name || member.login,
        email: member.email,
        organizationId: this.config.organizationId || 'default',
        avatarUrl: member.avatar_url
      }));
    } catch (error) {
      this.handleApiError(error, 'team users retrieval');
    }
  }

  async addUserToTeam(userId: string, teamId: string): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      await this.client.put(`/teams/${teamId}/members/${user.name}`);
    } catch (error) {
      this.handleApiError(error, 'add user to team');
    }
  }

  async removeUserFromTeam(userId: string, teamId: string): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      await this.client.delete(`/teams/${teamId}/members/${user.name}`);
    } catch (error) {
      this.handleApiError(error, 'remove user from team');
    }
  }

  async addUserToOrganization(userId: string, organizationId: string): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      const org = await this.getOrganization(organizationId);
      if (!org) {
        throw new Error(`Organization ${organizationId} not found`);
      }
      await this.client.put(`/orgs/${org.name}/members/${user.name}`);
    } catch (error) {
      this.handleApiError(error, 'add user to organization');
    }
  }

  // Team operations
  async createTeam(input: CreateTeamInput): Promise<Team> {
    try {
      const org = await this.getOrganization(input.organizationId);
      if (!org) {
        throw new Error(`Organization ${input.organizationId} not found`);
      }

      // Create team in DCS
      const { data: dcsTeam } = await this.client.post(`/orgs/${org.name}/teams`, {
        name: input.name,
        permission: 'write' // Default to write permission
      });

      // Add users to team in DCS
      if (input.userIds.length > 0) {
        for (const userId of input.userIds) {
          const user = await this.getUser(userId);
          if (user) {
            await this.client.put(`/teams/${dcsTeam.id}/members/${user.name}`);
          }
        }
      }

      return {
        id: dcsTeam.id.toString(),
        name: input.name,
        organizationId: input.organizationId,
        userIds: input.userIds
      };
    } catch (error) {
      this.handleApiError(error, 'team creation');
    }
  }

  async getTeam(id: string): Promise<Team | null> {
    try {
      // Get team from DCS
      const { data: dcsTeam } = await this.client.get(`/teams/${id}`);

      // Get team members
      const { data: dcsMembers } = await this.client.get<DCSUser[]>(`/teams/${id}/members`);
      const userIds = dcsMembers.map(member => member.id.toString());

      return {
        id: dcsTeam.id.toString(),
        name: dcsTeam.name,
        organizationId: dcsTeam.organization.id.toString(),
        userIds
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, 'team retrieval');
    }
  }

  async updateTeam(team: Team): Promise<Team> {
    try {
      const org = await this.getOrganization(team.organizationId);
      if (!org) {
        throw new Error(`Organization ${team.organizationId} not found`);
      }

      // Update team in DCS
      await this.client.patch(`/teams/${team.id}`, {
        name: team.name,
        permission: 'write'
      });

      // Update team members in DCS
      const currentTeamMembers = (await this.client.get(`/teams/${team.id}/members`)).data;
      const currentMemberNames = currentTeamMembers.map((m: { login: string }) => m.login);

      // Get all users that should be in the team
      const desiredUsers = await Promise.all(team.userIds.map(id => this.getUser(id)));
      const desiredUserNames = desiredUsers.filter(u => u !== null).map(u => u!.name);

      // Remove users that shouldn't be in the team
      for (const memberName of currentMemberNames) {
        if (!desiredUserNames.includes(memberName)) {
          await this.client.delete(`/teams/${team.id}/members/${memberName}`);
        }
      }

      // Add new users to the team
      for (const userName of desiredUserNames) {
        if (!currentMemberNames.includes(userName)) {
          await this.client.put(`/teams/${team.id}/members/${userName}`);
        }
      }

      return team;
    } catch (error) {
      this.handleApiError(error, 'team update');
    }
  }

  async deleteTeam(id: string): Promise<void> {
    try {
      // Delete team in DCS
      await this.client.delete(`/teams/${id}`);
    } catch (error) {
      this.handleApiError(error, 'team deletion');
    }
  }

  async getAllTeams(): Promise<Team[]> {
    try {
      const orgs = await this.getAllOrganizations();
      const allTeams: Team[] = [];

      for (const org of orgs) {
        // Get teams from DCS API
        const { data: dcsTeams } = await this.client.get(`/orgs/${org.name}/teams`);
        
        // Get members for each team
        for (const dcsTeam of dcsTeams) {
          const { data: dcsMembers } = await this.client.get<DCSUser[]>(`/teams/${dcsTeam.id}/members`);
          const userIds = dcsMembers.map(member => member.id.toString());

          allTeams.push({
            id: dcsTeam.id.toString(),
            name: dcsTeam.name,
            organizationId: org.id,
            userIds
          });
        }
      }

      return allTeams;
    } catch (error) {
      this.handleApiError(error, 'teams retrieval');
    }
  }

  async getTeamsByOrganization(orgId: string): Promise<Team[]> {
    try {
      const org = await this.getOrganization(orgId);
      if (!org) {
        return [];
      }

      // Get teams from DCS API
      const { data: dcsTeams } = await this.client.get(`/orgs/${org.name}/teams`);
      const teams: Team[] = [];

      // Get members for each team
      for (const dcsTeam of dcsTeams) {
        const { data: dcsMembers } = await this.client.get<DCSUser[]>(`/teams/${dcsTeam.id}/members`);
        const userIds = dcsMembers.map(member => member.id.toString());

        teams.push({
          id: dcsTeam.id.toString(),
          name: dcsTeam.name,
          organizationId: orgId,
          userIds
        });
      }

      return teams;
    } catch (error) {
      this.handleApiError(error, 'organization teams retrieval');
    }
  }

  slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  }

  // Project Management
  async createProject(input: CreateProjectInput): Promise<Project> {
    try {
      this.validateOrganizationId();
      // Create project data
      const projectData: ProcessedProjectData = {
        name: input.name,
        description: input.description || '',
        teamId: input.teamId,
        sourceResources: input.sourceResources,
        targetResources: input.targetResources,
        id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'project',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: '',
        milestones: [],
        resources: []
      };

      // Store project in project-management repo
      const validName = this.slugify(projectData.name);
      await this.storeMetadata(
        input.organizationId,
        'project-management',
        projectData,
        `projects/active/${validName}.json`
      );

      // Update project list
      await this.updateProjectList();

      return this.transformProject(projectData);
    } catch (error) {
      this.handleApiError(error, 'project creation');
    }
  }

  // Update the updateProjectList method to use browser-compatible base64 encoding
  private async updateProjectList(): Promise<void> {
    try {
      const projectList: ProjectList = {
        projects: [],
        lastUpdated: new Date().toISOString()
      };

      // Get projects from each folder
      const folders = ['active', 'completed', 'archived'];
      for (const folder of folders) {
        try {
          const { data: files } = await this.client.get<DCSFileContent[]>(
            `/repos/${this.config.organizationId}/project-management/contents/projects/${folder}`
          );

          for (const file of files) {
            if (file.name.endsWith('.json')) {
              // Get project data to extract ID
              const { data: projectFile } = await this.client.get<DCSFileContent>(
                `/repos/${this.config.organizationId}/project-management/contents/projects/${folder}/${file.name}`
              );
              const projectData = this.parseBase64Content<Project>(projectFile.content);

              projectList.projects.push({
                id: projectData.id,
                name: file.name.replace('.json', ''),
                status: folder
              });
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Folder doesn't exist yet, skip it
            continue;
          }
          throw error;
        }
      }

      // Get current project list file to get its SHA
      try {
        const { data: currentFile } = await this.client.get<DCSFileContent>(
          `/repos/${this.config.organizationId}/project-management/contents/projects/project-list.json`
        );

        

        // Update with SHA to handle concurrent updates
        await this.client.put(
          `/repos/${this.config.organizationId}/project-management/contents/projects/project-list.json`,
          {
            message: 'Update project list',
            content: this.toBase64Content(projectList),
            sha: currentFile.sha
          }
        );
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // File doesn't exist yet, create it
          await this.client.put(
            `/repos/${this.config.organizationId}/project-management/contents/projects/project-list.json`,
            {
              message: 'Create project list',
              content: this.toBase64Content(projectList)
            }
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.handleApiError(error, 'project list update');
    }
  }

  async getProjectFromList(id: string) {
    const projectList = await this.getProjectList();
    const projectEntry = projectList.projects.find(p => p.id === id);

    if (!projectEntry) {
      return null;
    }

    return projectEntry;
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      this.validateOrganizationId();
      // Get project list first to determine the correct folder
      const { data: projectListFile } = await this.client.get<DCSFileContent>(
        `/repos/${this.config.organizationId}/project-management/contents/projects/project-list.json`
      );

      const projectList = this.parseBase64Content<ProjectList>(projectListFile.content);
      const projectEntry = projectList.projects.find(p => p.id === id);

      if (!projectEntry) {
        return null;
      }

      // Now we can get the project from the correct folder
      const { data: projectFile } = await this.client.get<DCSFileContent>(
        `/repos/${this.config.organizationId}/project-management/contents/projects/${projectEntry.status}/${projectEntry.name}.json`
      );

      const project = this.parseBase64Content<Project>(projectFile.content);
      return project;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, 'project retrieval');
    }
  }

  async updateProject(project: Project): Promise<Project> {
    try {
      this.validateOrganizationId();
      const existingProject = await this.getProject(project.id);
      if (!existingProject) {
        throw new Error(`Project ${project.id} not found`);
      }

      if (project.name !== existingProject.name) {
        throw new Error(`Project name cannot be changed. Existing name: ${existingProject.name}, New name: ${project.name}`);
      }

      // Validate project status
      if (!VALID_PROJECT_STATUSES.includes(project.status as ProjectStatus)) {
        throw new Error(`Invalid project status: ${project.status}. Must be one of: ${VALID_PROJECT_STATUSES.join(', ')}`);
      }

      // Get file info to get the SHA
      const { data: projectFile } = await this.client.get<DCSFileContent>(
        `/repos/${this.config.organizationId}/project-management/contents/projects/${existingProject.status}/${this.slugify(existingProject.name)}.json`
      );

      // Update project file
      await this.client.put(
        `/repos/${this.config.organizationId}/project-management/contents/projects/${existingProject.status}/${this.slugify(existingProject.name)}.json`,
        {
          message: `Update project ${project.name}`,
          content: this.toBase64Content(project),
          sha: projectFile.sha
        }
      );

      // Update project list if status changed
      if (project.status !== existingProject.status) {
        await this.updateProjectList();
      }

      return project;
    } catch (error) {
      this.handleApiError(error, 'project update');
    }
  }

  async deleteProject(id: string): Promise<void> {

    try {
      this.validateOrganizationId();
      const project = await this.getProjectFromList(id);
      if (!project) return;

      // Get file info to get the SHA
      const { data: projectFile } = await this.client.get<DCSFileContent>(
        `/repos/${this.config.organizationId}/project-management/contents/projects/${project.status}/${project.name}.json`
      );

      // Delete project file
      await this.client.delete(
        `/repos/${this.config.organizationId}/project-management/contents/projects/${project.status}/${project.name}.json`,
        {
          data: {
            message: `Delete project ${project.name}`,
            sha: projectFile.sha
          }
        }
      );

      // Update project list
      await this.updateProjectList();
    } catch (error) {
      this.handleApiError(error, 'project deletion');
    }
  }

  private async getProjectList(): Promise<ProjectList> {
    const { data: projectListFile } = await this.client.get<DCSFileContent>(
      `/repos/${this.config.organizationId}/project-management/contents/projects/project-list.json`
    );
    return this.parseBase64Content<ProjectList>(projectListFile.content);
  }

  // private async getAllProjectsPaginated(page: number = 0, pageSize: number = 30): Promise<{ projects: ExtendedProject[]; hasMore: boolean }> {
  //   try {
  //     // Get project list
  //     const projectList = await this.getProjectList();
      
      
  //     // Calculate pagination
  //     const startIndex = (page - 1) * pageSize;
  //     const endIndex = startIndex + pageSize;
  //     const paginatedEntries = projectList.projects.slice(startIndex, endIndex);
  //     const hasMore = endIndex < projectList.projects.length;

  //     const projects: ExtendedProject[] = [];

  //     // Get each project's data
  //     for (const entry of paginatedEntries) {
  //       try {
  //         const { data: projectFile } = await this.client.get<DCSFileContent>(
  //           `/repos/${this.config.organizationId}/project-management/contents/projects/${entry.status}/${entry.name}.json`
  //         );
  //         const project = this.parseBase64Content<ExtendedProject>(projectFile.content);
  //         projects.push(project);
  //       } catch (error) {
  //         console.error(`Error loading project ${entry.name}:`, error);
  //         // Continue with other projects even if one fails
  //       }
  //     }

  //     return { projects, hasMore };
  //   } catch (error) {
  //     if (axios.isAxiosError(error) && error.response?.status === 404) {
  //       return { projects: [], hasMore: false };
  //     }
  //     this.handleApiError(error, 'projects retrieval');
  //   }
  // }

  private async getProcessedProjectData(projectId: string): Promise<ProcessedProjectData> {
    const project = await this.getProjectFromList(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    const { data: projectFile } = await this.client.get<DCSFileContent>(
      `/repos/${this.config.organizationId}/project-management/contents/projects/${project.status}/${project.name}.json`
    );
    return this.parseBase64Content<ProcessedProjectData>(projectFile.content);
  }
  
  private transformProject(project: ProcessedProjectData): Project {
    return {
      name: project.name,
      id: project.id,
      status: project.status,
      organizationId: this.config.organizationId || 'default',
      teamId: project.teamId,
      sourceResources: project.sourceResources,
      targetResources: project.targetResources
    };
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      this.validateOrganizationId();
      const projectList = await this.getProjectList();
      const allProjects: Project[] = [];

      for (const project of projectList.projects) {
        const projectData = await this.getProcessedProjectData(project.id);
        allProjects.push(this.transformProject(projectData));
      }
      return allProjects;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      this.handleApiError(error, 'projects retrieval');
    }
  }

  async getProcessedProjects(): Promise<ProcessedProjectData[]> {
    const projectList = await this.getProjectList();
    const allProjects: ProcessedProjectData[] = [];
    for (const project of projectList.projects) {
      const projectData = await this.getProcessedProjectData(project.id);
      allProjects.push(projectData);
    }
    return allProjects;
  }

  async getProjectsByOrganization(): Promise<ExtendedProject[]> {
    // Since projects are already organized by organization in the repo structure,
    // this is equivalent to getAllProjects when called with the correct organizationId
    return this.getAllProjects();
  }

  async getProjectsByTeam(teamId: string): Promise<ExtendedProject[]> {
    try {
      const projects = await this.getAllProjects();
      return projects.filter(project => project.teamId === teamId);
    } catch (error) {
      this.handleApiError(error, 'team projects retrieval');
    }
  }

  // Helper method to get milestone mappings from project metadata
  private async getMilestoneMappings(projectId: string, milestoneId: string): Promise<DCSMilestoneMapping[]> {
    const project = await this.getProcessedProjectData(projectId);
    const milestone = project.milestones.find(m => m.id === milestoneId);
    return milestone?.dcsMapping || [];
  }

  // Helper method to update milestone mappings in project metadata
  private async updateMilestoneMappings(projectId: string, milestoneId: string, mappings: DCSMilestoneMapping[], milestone?: Milestone): Promise<void> {
    const projectData = await this.getProcessedProjectData(projectId);
    const milestoneIndex = projectData.milestones.findIndex(m => m.id === milestoneId);
    
    if (milestoneIndex === -1) {
      throw new Error(`Milestone ${milestoneId} not found in project ${projectId}`);
    }

    projectData.milestones[milestoneIndex] = {
      ...projectData.milestones[milestoneIndex],
      dcsMapping: mappings,
      ...(milestone && {
        name: milestone.name,
        teamId: milestone.teamId,
        resources: milestone.resourceScope
      })
    };

    await this.storeMetadata(
      this.config.organizationId || 'default',
      'project-management',
      projectData as unknown as DCSMetadata,
      `projects/${projectData.status}/${this.slugify(projectData.name)}.json`
    );
  }

  // Add validation helpers at the top of the class
  private validateTaskInput(input: CreateTaskInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Task name is required');
    }
    if (input.name.length > 255) {
      throw new Error('Task name must be less than 255 characters');
    }
    if (!input.milestoneId) {
      throw new Error('Milestone ID is required');
    }
    if (!input.resourceId) {
      throw new Error('Resource ID is required');
    }
    if (!Array.isArray(input.assignedUserIds)) {
      throw new Error('Assigned user IDs must be an array');
    }
  }

  private validateMilestoneInput(input: CreateMilestoneInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Milestone name is required');
    }
    if (input.name.length > 255) {
      throw new Error('Milestone name must be less than 255 characters');
    }
    if (!input.projectId) {
      throw new Error('Project ID is required');
    }
    if (!Array.isArray(input.resourceScope) || input.resourceScope.length === 0) {
      throw new Error('Resource scope must be a non-empty array');
    }
  }

  // Milestone operations
  async createMilestone(input: CreateMilestoneInput): Promise<Milestone> {
    try {
      this.validateOrganizationId();
      this.validateMilestoneInput(input);
      if (!input.projectId) {
        throw new Error('Project ID is required');
      }
      const projectData = await this.getProcessedProjectData(input.projectId);
      
      if (!input.resourceScope.every(resource => projectData.targetResources.includes(resource))) {
        throw new Error('Milestone resources must be a subset of project resources');
      }

      const dcsMappings: DCSMilestoneMapping[] = [];
      const createdMilestones: { repoName: string; milestoneId: string }[] = [];

      try {
        // Create milestone in each resource repository
        for (const resourceRepo of input.resourceScope) {
          try {
            const { data: dcsMilestone } = await this.client.post(
              `/repos/${this.config.organizationId}/${resourceRepo}/milestones`,
              { title: input.name }
            );

            createdMilestones.push({
              repoName: resourceRepo,
              milestoneId: dcsMilestone.id.toString()
            });

            dcsMappings.push({
              repoName: resourceRepo,
              milestoneId: dcsMilestone.id.toString()
            });
          } catch (error) {
            // If any creation fails, rollback all created milestones
            await this.rollbackCreatedMilestones(createdMilestones);
            throw error;
          }
        }

        // Create milestone object
        const milestone: Milestone = {
          id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'milestone',
          name: input.name,
          projectId: input.projectId,
          teamId: input.teamId,
          resourceScope: input.resourceScope,
          status: 'open'
        };

        // Update project metadata with milestone mappings
        const processedMilestone: ProcessedProjectMilestone = {
          id: milestone.id,
          name: milestone.name,
          description: '',
          startDate: new Date().toISOString(),
          targetDate: '',
          status: 'open',
          resources: milestone.resourceScope,
          teamId: input.teamId,
          dcsMapping: dcsMappings
        };

        if (!projectData.milestones) {
          projectData.milestones = [];
        }

        projectData.milestones.push(processedMilestone);
        await this.storeMetadata(
          this.config.organizationId || 'default',
          'project-management',
          projectData,
          `projects/${projectData.status}/${this.slugify(projectData.name)}.json`
        );

        return milestone;
      } catch (error) {
        // If anything fails after milestone creation, rollback
        await this.rollbackCreatedMilestones(createdMilestones);
        throw error;
      }
    } catch (error) {
      this.handleApiError(error, 'milestone creation');
    }
  }

  private async rollbackCreatedMilestones(milestones: { repoName: string; milestoneId: string }[]): Promise<void> {
    for (const milestone of milestones) {
      try {
        await this.client.patch(
          `/repos/${this.config.organizationId}/${milestone.repoName}/milestones/${milestone.milestoneId}`,
          { state: 'closed' }
        );
      } catch (error) {
        console.error(`Failed to rollback milestone in repo ${milestone.repoName}:`, error);
        // Continue with other rollbacks even if one fails
      }
    }
  }

  async getMilestone(id: string, projectId: string): Promise<Milestone | null> {
    try {
      this.validateOrganizationId();
      // Find the milestone in project metadata
      const projectData = await this.getProcessedProjectData(projectId);
      const milestone = projectData.milestones.find(m => m.id === id);
      if (milestone) {
        return {
          id: milestone.id,
          type: 'milestone',
          name: milestone.name,
          projectId: projectId,
          teamId: milestone.teamId,
          resourceScope: milestone.resources,
          status: milestone.status
        };
      }
      return null;
    } catch (error) {
      this.handleApiError(error, 'milestone retrieval');
    }
  }

  async updateMilestone(milestone: Milestone): Promise<Milestone> {
    try {
      this.validateOrganizationId();
      // Get existing milestone mappings
      const mappings = await this.getMilestoneMappings(milestone.projectId, milestone.id);

      // Update milestone in each mapped repository
      for (const mapping of mappings) {
        try {
          await this.client.patch(
            `/repos/${this.config.organizationId}/${mapping.repoName}/milestones/${mapping.milestoneId}`,
            { title: milestone.name, state: milestone.status, description: milestone.description }
          );
        } catch (error) {
          console.error(`Failed to update milestone in repo ${mapping.repoName}:`, error);
          // Continue with other repos even if one fails
        }
      }

      // Update milestone mappings and properties
      await this.updateMilestoneMappings(milestone.projectId, milestone.id, mappings, milestone);

      return milestone;
    } catch (error) {
      this.handleApiError(error, 'milestone update');
    }
  }

  async deleteMilestone(id: string, projectId: string): Promise<void> {
    try {
      this.validateOrganizationId();
      // First get the milestone to get its project ID and mappings
      const milestone = await this.getMilestone(id, projectId);
      if (!milestone) return;

      // Get milestone mappings
      const mappings = await this.getMilestoneMappings(milestone.projectId, id);

      // Delete milestone in each mapped repository
      for (const mapping of mappings) {
        try {
          await this.client.patch(
            `/repos/${this.config.organizationId}/${mapping.repoName}/milestones/${mapping.milestoneId}`,
            { state: 'closed' }  // DCS doesn't allow deleting milestones, so we close them
          );
        } catch (error) {
          console.error(`Failed to delete milestone in repo ${mapping.repoName}:`, error);
          // Continue with other repos even if one fails
        }
      }

      const project = await this.getProject(milestone.projectId);
      if (!project) {
        throw new Error(`Project ${milestone.projectId} not found`);
      }

      // Update project metadata to remove the milestone
      const projectResponse = await this.client.get<DCSFileContent>(
        `/repos/${this.config.organizationId}/project-management/contents/projects/${project.status}/${project.name}.json`
      );

      if (projectResponse.data) {
        const projectData = this.parseBase64Content<ProcessedProjectData>(projectResponse.data.content);
        projectData.milestones = projectData.milestones.filter(m => m.id !== id);

        await this.storeMetadata(
          this.config.organizationId || 'default',
          'project-management',
          projectData as unknown as DCSMetadata,
          `projects/${projectData.status}/${projectData.name}.json`
        );
      }
    } catch (error) {
      this.handleApiError(error, 'milestone deletion');
    }
  }

  async getAllMilestones(): Promise<Milestone[]> {
    try {
      // Get all milestones from DCS
      const { data: dcsMilestones } = await this.client.get(`/repos/${this.config.organizationId}/project-management/milestones`);
      const milestones: Milestone[] = [];

      for (const dcsMilestone of dcsMilestones) {
        const project = await this.getProject(dcsMilestone.title.split('-')[0]);
        if (project) {
          milestones.push({
            id: dcsMilestone.id.toString(),
            type: 'milestone',
            name: dcsMilestone.title,
            projectId: project.id,
            teamId: project.teamId,
            resourceScope: [],
            status: 'open'
          });
        }
      }

      return milestones;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      this.handleApiError(error, 'milestones retrieval');
    }
  }

  async getMilestonesByProject(projectId: string): Promise<Milestone[]> {
    try {
      const projectData = await this.getProcessedProjectData(projectId);
      return projectData.milestones?.map(m => ({
        id: m.id,
        type: 'milestone',
        name: m.name,
        projectId: projectId,
        teamId: m.teamId,
        resourceScope: m.resources,
        status: m.status
      })) || [];
    } catch (error) {
      this.handleApiError(error, 'project milestones retrieval');
    }
  }

  async getMilestonesByTeam(teamId: string): Promise<Milestone[]> {
    try {
      const milestones = await this.getAllMilestones();
      return milestones.filter(m => m.teamId === teamId);
    } catch (error) {
      this.handleApiError(error, 'team milestones retrieval');
    }
  }

  // Task operations
  async createTask(input: CreateTaskInput, projectId: string): Promise<Task> {
    try {
      this.validateOrganizationId();
      this.validateTaskInput(input);
      // Get the milestone to get its project ID
      const milestone = await this.getMilestone(input.milestoneId, projectId);
      if (!milestone) {
        throw new Error(`Milestone ${input.milestoneId} not found`);
      }

      // Get milestone mapping for the resource
      const mappings = await this.getMilestoneMappings(milestone.projectId, input.milestoneId);
      const mapping = mappings.find(m => m.repoName === input.resourceId);
      
      if (!mapping) {
        throw new Error(`No milestone mapping found for resource ${input.resourceId}`);
      }

      // Create issue in DCS
      const { data: dcsIssue } = await this.client.post<DCSIssue>(
        `/repos/${this.config.organizationId}/${input.resourceId}/issues`,
        {
          title: input.name,
          body: input.description || '',
          assignees: input.assignedUserIds,
          milestone: parseInt(mapping.milestoneId)
        }
      );

      // Convert DCS issue to Task with explicit type
      const task: Task = {
        id: dcsIssue.number.toString(),
        type: 'task',
        name: dcsIssue.title,
        milestoneId: input.milestoneId,
        assignedUserIds: dcsIssue.assignees?.map(a => a.id.toString()) || [],
        resourceId: input.resourceId,
        status: dcsIssue.state === 'closed' ? 'closed' : 'open',
        description: dcsIssue.body
      };

      return task;
    } catch (error) {
      this.handleApiError(error, 'task creation');
    }
  }

  async getTask(id: string, milestoneId: string, projectId: string): Promise<Task | null> {
    try {
      this.validateOrganizationId();
      // Since tasks are stored as issues in resource repositories,
      // we need to search through all resources in the organization
      const milestone = await this.getMilestone(milestoneId, projectId);
      
      for (const resource of milestone?.resourceScope || []) {
        try {
          const { data: dcsIssue } = await this.client.get<DCSIssue>(
            `/repos/${this.config.organizationId}/${resource}/issues/${id}`
          );

          if (dcsIssue) {
            // Find the milestone this issue belongs to
            const projects = await this.getAllProjects();
            let milestoneId = '';

            for (const project of projects) {
              const projectData = await this.getProcessedProjectData(project.id);
              for (const milestone of projectData.milestones) {
                const mapping = milestone.dcsMapping.find(
                  m => m.repoName === resource && m.milestoneId === dcsIssue.milestone?.id.toString()
                );
                if (mapping) {
                  milestoneId = milestone.id;
                  break;
                }
              }
              if (milestoneId) break;
            }

            return {
              id: dcsIssue.number.toString(),
              type: 'task',
              name: dcsIssue.title,
              milestoneId,
              assignedUserIds: dcsIssue.assignees?.map(a => a.id.toString()) || [],
              resourceId: resource,
              status: dcsIssue.state === 'closed' ? 'closed' : 'open',
              description: dcsIssue.body
            };
          }
        } catch (error) {
          // Continue searching in other resources if issue not found
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            continue;
          }
          throw error;
        }
      }

      return null;
    } catch (error) {
      this.handleApiError(error, 'task retrieval');
    }
  }

  async updateTask(task: Task, projectId: string): Promise<Task> {
    try {
      this.validateOrganizationId();
      // Get the milestone to get its project ID
      const milestone = await this.getMilestone(task.milestoneId, projectId);
      if (!milestone) {
        throw new Error(`Milestone ${task.milestoneId} not found`);
      }

      // Get milestone mapping for the resource
      const mappings = await this.getMilestoneMappings(milestone.projectId, task.milestoneId);
      const mapping = mappings.find(m => m.repoName === task.resourceId);
      
      if (!mapping) {
        throw new Error(`Resource ${task.resourceId} not mapped to milestone ${task.milestoneId}`);
      }
      const assignees = await Promise.all(task.assignedUserIds.map(async id => {
        if (!id) return {assignees: []}
        const user = await this.getUser(id);
        return user?.name ? {assignees: user?.name} : {assignees: []};
      }))
      // Update issue in the resource repository
      await this.client.patch(
        `/repos/${this.config.organizationId}/${task.resourceId}/issues/${task.id}`,
        {
          title: task.name,
          body: task.description || '',
          milestone: parseInt(mapping.milestoneId),
          ...assignees,
          state: task.status
        }
      );

      return task;
    } catch (error) {
      this.handleApiError(error, 'task update');
    }
  }

  async deleteTask(id: string, milestoneId: string, projectId: string): Promise<void> {
    try {
      const task = await this.getTask(id, milestoneId, projectId);
      if (!task) return;

      // Close issue in the resource repository (GitHub API doesn't allow deleting issues)
      await this.client.patch(
        `/repos/${this.config.organizationId}/${task.resourceId}/issues/${id}`,
        { state: 'closed' }
      );
    } catch (error) {
      this.handleApiError(error, 'task deletion');
    }
  }

  private async getAllTasksPaginated(page: number = 1, pageSize: number = 30): Promise<{ tasks: Task[]; hasMore: boolean }> {
    try {
      const tasks: Task[] = [];
      const resources = await this.getAllResources();
      let totalCount = 0;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      // Get issues from each resource repository
      for (const resource of resources) {
        try {
          const { data: dcsIssues } = await this.client.get<DCSIssue[]>(
            `/repos/${this.config.organizationId}/${resource.name}/issues`,
            { 
              params: { 
                state: 'all',
                page: page,
                per_page: pageSize
              } 
            }
          );

          // Find corresponding milestones for the issues
          const projects = await this.getAllProjects();
          for (const dcsIssue of dcsIssues) {
            if (!dcsIssue.milestone) continue;

            let milestoneId = '';
            for (const project of projects) {
              const projectData = await this.getProcessedProjectData(project.id);
              for (const milestone of projectData.milestones) {
                const mapping = milestone.dcsMapping.find(
                  m => m.repoName === resource.name && m.milestoneId === dcsIssue.milestone?.id.toString()
                );
                if (mapping) {
                  milestoneId = milestone.id;
                  break;
                }
              }
              if (milestoneId) break;
            }

            if (milestoneId) {
              totalCount++;
              if (totalCount > startIndex && totalCount <= endIndex) {
                tasks.push({
                  id: dcsIssue.number.toString(),
                  type: 'task',
                  name: dcsIssue.title,
                  milestoneId,
                  assignedUserIds: dcsIssue.assignees?.map(a => a.id.toString()) || [],
                  resourceId: resource.name,
                  status: dcsIssue.state === 'closed' ? 'closed' : 'open',
                  description: dcsIssue.body
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error getting tasks from resource ${resource.name}:`, error);
          // Continue with other resources even if one fails
        }
      }

      return { 
        tasks,
        hasMore: totalCount > endIndex
      };
    } catch (error) {
      this.handleApiError(error, 'tasks retrieval');
    }
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const allTasks: Task[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const { tasks, hasMore: moreTasks } = await this.getAllTasksPaginated(page);
        allTasks.push(...tasks);
        hasMore = moreTasks;
        page++;
      }

      return allTasks;
    } catch (error) {
      this.handleApiError(error, 'tasks retrieval');
    }
  }

  async getTasksByMilestone(milestoneId: string, projectId: string): Promise<Task[]> {
    try {
      const milestone = await this.getMilestone(milestoneId, projectId);
      if (!milestone) {
        throw new Error(`Milestone ${milestoneId} not found`);
      }

      const mappings = await this.getMilestoneMappings(milestone.projectId, milestoneId);
      const tasks: Task[] = [];

      // Get tasks from each mapped repository
      for (const mapping of mappings) {
        try {
          const { data: dcsIssues } = await this.client.get<DCSIssue[]>(
            `/repos/${this.config.organizationId}/${mapping.repoName}/issues`,
            {
              params: {
                type: 'issues',
                milestones: mapping.milestoneId,
                state: 'open'
              }
            }
          );

          tasks.push(...dcsIssues.map(issue => ({
            id: issue.number.toString(),
            type: 'task' as const,
            name: issue.title,
            milestoneId,
            assignedUserIds: issue.assignees?.map(a => a.id.toString()),
            resourceId: mapping.repoName,
            status: (issue.state === 'closed' ? 'closed' : 'open') as 'closed' | 'open',
            description: issue.body
          })));
        } catch (error) {
          console.error(`Error getting tasks from resource ${mapping.repoName}:`, error);
          // Continue with other resources even if one fails
        }
      }

      return tasks;
    } catch (error) {
      this.handleApiError(error, 'milestone tasks retrieval');
    }
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    try {
      const user = await this.getUser(userId);
      if (!user) return [];

      const tasks: Task[] = [];
      const resources = await this.getAllResources();

      // Get assigned issues from each resource repository
      for (const resource of resources) {
        try {
          const { data: dcsIssues } = await this.client.get<DCSIssue[]>(
            `/repos/${this.config.organizationId}/${resource.name}/issues`,
            {
              params: {
                assignee: user.name,
                state: 'all'
              }
            }
          );

          // Find corresponding milestones for the issues
          const projects = await this.getProcessedProjects();
          for (const dcsIssue of dcsIssues) {
            if (!dcsIssue.milestone) continue;

            let milestoneId = '';
            for (const project of projects) {              
              for (const milestone of project.milestones) {
                const mapping = milestone.dcsMapping.find(
                  m => m.repoName === resource.name && m.milestoneId === dcsIssue.milestone?.id.toString()
                );
                if (mapping) {
                  milestoneId = milestone.id;
                  break;
                }
              }
              if (milestoneId) break;
            }

            if (milestoneId) {
              tasks.push({
                id: dcsIssue.number.toString(),
                type: 'task',
                name: dcsIssue.title,
                milestoneId,
                assignedUserIds: dcsIssue.assignees?.map(a => a.id.toString()) || [],
                resourceId: resource.name,
                status: dcsIssue.state === 'closed' ? 'closed' : 'open',
                description: dcsIssue.body
              });
            }
          }
        } catch (error) {
          console.error(`Error getting tasks from resource ${resource.name}:`, error);
          // Continue with other resources even if one fails
        }
      }

      return tasks;
    } catch (error) {
      this.handleApiError(error, 'user tasks retrieval');
    }
  }

  // Resource operations
  async createResource(input: CreateResourceInput): Promise<Resource> {
    try {
      // Create repository in DCS
      const { data: dcsRepo } = await this.client.post<DCSRepository>(`/org/${this.config.organizationId}/repos`, {
        name: input.name,
        description: `Resource repository for ${input.name}`,
        private: true
      });

      return {
        id: dcsRepo.id.toString(),
        type: 'resource',
        name: input.name,
        organizationId: input.organizationId,
        path: input.path,
        contentType: input.contentType,
        language: input.language,
        version: input.version
      };
    } catch (error) {
      this.handleApiError(error, 'resource creation');
    }
  }

  async getResource(id: string): Promise<Resource | null> {
    try {
      // Get repository from DCS
      const { data: dcsRepo } = await this.client.get<DCSRepository>(`/repositories/${id}`);
      
      // Extract resource info from repository name and description
      // Assuming repository name format: "resource-name"
      return {
        id: dcsRepo.id.toString(),
        type: 'resource',
        name: dcsRepo.name,
        organizationId: dcsRepo.owner.id.toString(),
        path: '', // Path is not stored in DCS repository
        contentType: '', // Content type is not stored in DCS repository
        language: '', // Language is not stored in DCS repository
        version: '' // Version is not stored in DCS repository
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, 'resource retrieval');
    }
  }

  async updateResource(resource: Resource): Promise<Resource> {
    try {
      // Update repository in DCS
      await this.client.patch<DCSRepository>(`/repos/${this.config.organizationId}/${resource.name}`, {
        name: resource.name,
        description: `Resource repository for ${resource.name}`
      });

      return resource;
    } catch (error) {
      this.handleApiError(error, 'resource update');
    }
  }

  async deleteResource(id: string): Promise<void> {
    try {
      const resource = await this.getResource(id);
      if (!resource) return;

      // First, find all projects that reference this resource
      const projects = await this.getProcessedProjects();
      for (const project of projects) {
        let projectUpdated = false;
        
        // Remove resource from project resources
        const targetResourceIndex = project.targetResources.indexOf(resource.name);
        if (targetResourceIndex !== -1) {
          project.targetResources.splice(targetResourceIndex, 1);
          projectUpdated = true;
        }

        // Remove resource from project source resources
        const sourceResourceIndex = project.sourceResources.indexOf(resource.name);
        if (sourceResourceIndex !== -1) {
          project.sourceResources.splice(sourceResourceIndex, 1);
          projectUpdated = true;
        }

        // Remove resource mappings from milestones
        for (const milestone of project.milestones) {
          const mappingIndex = milestone.dcsMapping.findIndex(m => m.repoName === resource.name);
          if (mappingIndex !== -1) {
            milestone.dcsMapping.splice(mappingIndex, 1);
            projectUpdated = true;
          }
        }

        // Update project if changes were made
        if (projectUpdated) {
          await this.storeMetadata(
            this.config.organizationId || 'default',
            'project-management',
            project,
            `projects/${project.status}/${project.name}.json`
          );
        }
      }

      // Finally, delete the repository in DCS
      await this.client.delete(`/repositories/${id}`);
    } catch (error) {
      this.handleApiError(error, 'resource deletion');
    }
  }

  async getAllResources(): Promise<Resource[]> {
    try {
      // Get all repositories from DCS
      const { data: dcsRepos } = await this.client.get<DCSRepository[]>(`/orgs/${this.config.organizationId}/repos`);
      
      // Filter out non-resource repositories (like project-management)
      const resourceRepos = dcsRepos.filter(repo => repo.name !== 'project-management');

      return resourceRepos.map(repo => ({
        id: repo.id.toString(),
        type: 'resource',
        name: repo.name,
        organizationId: repo.owner.id.toString(),
        path: '', // Path is not stored in DCS repository
        contentType: '', // Content type is not stored in DCS repository
        language: '', // Language is not stored in DCS repository
        version: '' // Version is not stored in DCS repository
      }));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      this.handleApiError(error, 'resources retrieval');
    }
  }

  async getResourcesByOrganization(orgId: string): Promise<Resource[]> {
    try {
      // Get all repositories from DCS
      const { data: dcsRepos } = await this.client.get<DCSRepository[]>(`/orgs/${orgId}/repos`);
      
      // Filter out non-resource repositories (like project-management)
      const resourceRepos = dcsRepos.filter(repo => repo.name !== 'project-management');

      return resourceRepos.map(repo => ({
        id: repo.id.toString(),
        type: 'resource',
        name: repo.name,
        organizationId: orgId,
        path: '', // Path is not stored in DCS repository
        contentType: '', // Content type is not stored in DCS repository
        language: '', // Language is not stored in DCS repository
        version: '' // Version is not stored in DCS repository
      }));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      this.handleApiError(error, 'organization resources retrieval');
    }
  }
} 