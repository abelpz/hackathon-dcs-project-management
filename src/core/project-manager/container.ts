import { Container } from 'inversify';
import { TYPES } from './types';
import { ProjectManager } from './ProjectManager';
import { RxDBStorageService } from './storage/RxDBStorageService';
import { UserManager } from './UserManager';
import { OrganizationManager } from './OrganizationManager';
import type { IStorageService, ProjectManagerConfig } from './types';

const container = new Container();

// Default configuration
const defaultConfig: ProjectManagerConfig = {
  organizationId: '',
  // token is now optional and not included by default
  apiUrl: 'https://qa.door43.org/api/v1'
};

// Bind services and managers in singleton scope
container.bind<IStorageService>(TYPES.StorageService).to(RxDBStorageService).inSingletonScope();
container.bind<ProjectManager>(TYPES.ProjectManager).to(ProjectManager).inSingletonScope();
container.bind<UserManager>(TYPES.UserManager).to(UserManager).inSingletonScope();
container.bind<OrganizationManager>(TYPES.OrganizationManager).to(OrganizationManager).inSingletonScope();
container.bind<ProjectManagerConfig>(TYPES.Config).toConstantValue(defaultConfig);

/**
 * Configure the project manager with organization and authentication details
 * @param config Configuration options
 * - organizationId: Required for all storage types
 * - token: Required only for remote API-based storage services
 * - apiUrl: Optional URL for remote API-based storage services
 */
export function configureProjectManager(config: Partial<ProjectManagerConfig>): void {
  const currentConfig = container.get<ProjectManagerConfig>(TYPES.Config);
  const newConfig = { ...currentConfig, ...config };
  
  // Unbind and then bind with new config
  container.unbind(TYPES.Config);
  container.bind<ProjectManagerConfig>(TYPES.Config).toConstantValue(newConfig);
  
  // If the project manager is already created, update its config
  try {
    const projectManager = container.get<ProjectManager>(TYPES.ProjectManager);
    projectManager.updateConfig(newConfig);
  } catch (error) {
    // ProjectManager not yet instantiated, which is fine
  }
}

/**
 * Get the ProjectManager instance
 * @returns ProjectManager instance
 */
export function getProjectManager(): ProjectManager {
  return container.get<ProjectManager>(TYPES.ProjectManager);
}

/**
 * Get the UserManager instance
 * @returns UserManager instance
 */
export function getUserManager(): UserManager {
  return container.get<UserManager>(TYPES.UserManager);
}

/**
 * Get the OrganizationManager instance
 * @returns OrganizationManager instance
 */
export function getOrganizationManager(): OrganizationManager {
  return container.get<OrganizationManager>(TYPES.OrganizationManager);
}

export default container; 