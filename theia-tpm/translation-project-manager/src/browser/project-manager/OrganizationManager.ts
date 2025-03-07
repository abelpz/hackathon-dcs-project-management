import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import type { IStorageService, CreateOrganizationInput, CreateTeamInput, UpdateTeamInput } from './types';
import type { Organization, Team, User } from './models';

@injectable()
export class OrganizationManager {
  constructor(
    @inject(TYPES.StorageService) private storageService: IStorageService
  ) {}

  // Organization methods
  async createOrganization(name: string): Promise<Organization> {
    const input: CreateOrganizationInput = {
      type: 'organization',
      name,
      teamIds: []
    };
    return this.storageService.createOrganization(input);
  }

  async getOrganization(id: string): Promise<Organization | null> {
    return this.storageService.getOrganization(id);
  }

  async updateOrganization(org: Organization): Promise<Organization> {
    return this.storageService.updateOrganization(org);
  }

  async deleteOrganization(id: string): Promise<void> {
    await this.storageService.deleteOrganization(id);
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return this.storageService.getAllOrganizations();
  }

  // Team management methods
  async createTeam(input: CreateTeamInput): Promise<Team> {
    return this.storageService.createTeam(input);
  }

  async getTeam(id: string): Promise<Team | null> {
    return this.storageService.getTeam(id);
  }

  async updateTeam(input: UpdateTeamInput): Promise<Team> {
    return this.storageService.updateTeam(input);
  }

  async deleteTeam(id: string): Promise<void> {
    await this.storageService.deleteTeam(id);
  }

  async getTeamsByOrganization(organizationId: string): Promise<Team[]> {
    return this.storageService.getTeamsByOrganization(organizationId);
  }

  // User management methods
  async getUser(id: string): Promise<User | null> {
    return this.storageService.getUser(id);
  }

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return this.storageService.getUsersByOrganization(organizationId);
  }

  async addUserToTeam(userId: string, teamId: string): Promise<void> {
    await this.storageService.addUserToTeam(userId, teamId);
  }

  async removeUserFromTeam(userId: string, teamId: string): Promise<void> {
    await this.storageService.removeUserFromTeam(userId, teamId);
  }

  // Convenience methods
  async getTeamMembers(teamId: string): Promise<User[]> {
    const team = await this.getTeam(teamId);
    if (!team) {
      return [];
    }
    
    const users = await this.getUsersByOrganization(team.organizationId);
    return users.filter(user => team.userIds.includes(user.id));
  }
  
  async getUserTeams(userId: string, organizationId: string): Promise<Team[]> {
    const teams = await this.getTeamsByOrganization(organizationId);
    return teams.filter(team => team.userIds.includes(userId));
  }
} 