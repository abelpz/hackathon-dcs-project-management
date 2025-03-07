import { injectable } from '@theia/core/shared/inversify';
import { ProjectManager } from './project-manager/ProjectManager';
import { DCSStorageService } from './project-manager/storage/DCSStorageService';

export const ProjectManagerServiceSymbol = Symbol('ProjectManagerService');

export interface ProjectManagerService {
    initialize(token: string, apiUrl: string, organizationId: string): Promise<void>;
    getProjectManager(): ProjectManager | undefined;
    clearProjectManager(): void;
}

@injectable()
export class ProjectManagerServiceImpl implements ProjectManagerService {
    protected projectManager: ProjectManager | undefined;

    async initialize(token: string, apiUrl: string, organizationId: string): Promise<void> {
        const storageService = new DCSStorageService();
        storageService.setConfig({
            token,
            apiUrl,
            organizationId
        });

        this.projectManager = new ProjectManager(storageService, {
            organizationId,
            token
        });
        await this.projectManager.initialize();
    }

    getProjectManager(): ProjectManager | undefined {
        return this.projectManager;
    }

    clearProjectManager(): void {
        this.projectManager = undefined;
    }
} 