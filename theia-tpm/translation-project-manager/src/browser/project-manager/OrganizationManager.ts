import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import type { IStorageService, CreateOrganizationInput } from './types';
import type { Organization } from './models';

@injectable()
export class OrganizationManager {
  constructor(
    @inject(TYPES.StorageService) private storageService: IStorageService
  ) {}

  async createOrganization(name: string): Promise<Organization> {
    const input: CreateOrganizationInput = {
      type: 'organization',
      name,
      teamIds: [] // Initialize with empty team IDs array
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
} 