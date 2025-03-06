import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import type { IStorageService, CreateUserInput, CreateTeamInput } from './types';
import type { User, Team } from './models';

@injectable()
export class UserManager {
  constructor(
    @inject(TYPES.StorageService) private storageService: IStorageService,
    @inject(TYPES.Config) private config: { organizationId: string }
  ) {}

  // User Management
  async createUser(name: string, email: string, organizationId?: string): Promise<User> {
    const input: CreateUserInput = {
      type: 'user',
      name,
      email,
      organizationId: organizationId || this.config.organizationId
    };
    return this.storageService.createUser(input);
  }

  async getUser(id: string): Promise<User | null> {
    return this.storageService.getUser(id);
  }

  async updateUser(user: User): Promise<User> {
    return this.storageService.updateUser(user);
  }

  async deleteUser(id: string): Promise<void> {
    await this.storageService.deleteUser(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.storageService.getAllUsers();
  }

  async getUsersByOrganization(orgId?: string): Promise<User[]> {
    return this.storageService.getUsersByOrganization(orgId || this.config.organizationId);
  }

  async getUsersByTeam(teamId: string): Promise<User[]> {
    return this.storageService.getUsersByTeam(teamId);
  }

  async getCurrentOrganizationUsers(): Promise<User[]> {
    return this.getUsersByOrganization();
  }

  // Team Management
  async createTeam(name: string, userIds: string[], organizationId?: string): Promise<Team> {
    const input: CreateTeamInput = {
      type: 'team',
      name,
      userIds,
      organizationId: organizationId || this.config.organizationId
    };
    return this.storageService.createTeam(input);
  }

  async getTeam(id: string): Promise<Team | null> {
    return this.storageService.getTeam(id);
  }

  async updateTeam(team: Team): Promise<Team> {
    return this.storageService.updateTeam(team);
  }

  async deleteTeam(id: string): Promise<void> {
    await this.storageService.deleteTeam(id);
  }

  async getAllTeams(): Promise<Team[]> {
    return this.storageService.getAllTeams();
  }

  async getTeamsByOrganization(orgId?: string): Promise<Team[]> {
    return this.storageService.getTeamsByOrganization(orgId || this.config.organizationId);
  }

  async getCurrentOrganizationTeams(): Promise<Team[]> {
    return this.getTeamsByOrganization();
  }
} 