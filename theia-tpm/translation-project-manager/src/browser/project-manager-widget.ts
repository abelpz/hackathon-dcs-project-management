import { BaseWidget, Message } from '@theia/core/lib/browser';
import { injectable, inject, postConstruct } from 'inversify';
import { MessageService } from '@theia/core';
import { ProjectManager } from '../../core/project-manager/ProjectManager';
import { DCSStorageService } from '../../core/project-manager/storage/DCSStorageService';

interface Organization {
    id: number;
    username: string;
    full_name: string;
}

@injectable()
export class ProjectManagerWidget extends BaseWidget {
    static readonly ID = 'project-manager-widget';
    static readonly LABEL = 'Project Manager';

    @inject(MessageService)
    protected readonly messageService: MessageService;

    protected projectManager: ProjectManager | undefined;
    protected organizations: Organization[] = [];

    constructor() {
        super();
        this.id = ProjectManagerWidget.ID;
        this.title.label = ProjectManagerWidget.LABEL;
        this.title.caption = ProjectManagerWidget.LABEL;
        this.title.closable = false;
        this.title.iconClass = 'fa fa-project-diagram';
        this.addClass('project-manager-widget');
        
        // Check for existing session
        this.checkExistingSession();
    }

    protected async checkExistingSession(): Promise<void> {
        const token = localStorage.getItem('dcs.token');
        const apiUrl = localStorage.getItem('dcs.apiUrl') || 'https://git.door43.org/api/v1';
        const organizationId = localStorage.getItem('dcs.organizationId');

        if (token && organizationId) {
            try {
                // Validate token
                const response = await fetch(`${apiUrl}/user`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    await this.initializeProjectManager(token, apiUrl, organizationId);
                    return;
                }
            } catch (error) {
                console.error('Session validation error:', error);
            }
            // Clear invalid session
            this.clearSession();
        }

        this.renderLoginForm();
    }

    protected clearSession(): void {
        localStorage.removeItem('dcs.token');
        localStorage.removeItem('dcs.apiUrl');
        localStorage.removeItem('dcs.organizationId');
        this.projectManager = undefined;
    }

    protected renderLoginForm(): void {
        this.node.innerHTML = `
            <div class="login-container">
                <form class="login-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required class="theia-input">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required class="theia-input">
                    </div>
                    <div class="form-group">
                        <label for="apiUrl">DCS API URL</label>
                        <input type="url" id="apiUrl" name="apiUrl" value="https://git.door43.org/api/v1" required class="theia-input">
                    </div>
                    <button type="submit" class="theia-button main">Login</button>
                </form>
                <div class="loading-indicator hidden">
                    <div class="spinner"></div>
                </div>
            </div>
        `;

        const form = this.node.querySelector('.login-form') as HTMLFormElement;
        form.addEventListener('submit', this.handleLogin.bind(this));
    }

    protected async handleLogin(event: Event): Promise<void> {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const apiUrl = formData.get('apiUrl') as string;

        this.toggleLoading(true);

        try {
            const response = await fetch(`${apiUrl}/users/${username}/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                },
                body: JSON.stringify({
                    name: 'theia-project-manager-' + Date.now()
                })
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const { sha1 } = await response.json();
            localStorage.setItem('dcs.token', sha1);
            localStorage.setItem('dcs.apiUrl', apiUrl);

            await this.loadOrganizations(sha1, apiUrl);
        } catch (error) {
            this.messageService.error('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
            this.toggleLoading(false);
        }
    }

    protected async loadOrganizations(token: string, apiUrl: string): Promise<void> {
        try {
            const response = await fetch(`${apiUrl}/user/orgs`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch organizations');
            }

            this.organizations = await response.json();
            this.renderOrganizationSelector();
        } catch (error) {
            this.messageService.error('Failed to load organizations');
            console.error('Organization loading error:', error);
            this.toggleLoading(false);
        }
    }

    protected renderOrganizationSelector(): void {
        this.node.innerHTML = `
            <div class="organization-list">
                <h3>Select an Organization</h3>
                <div class="organizations">
                    ${this.organizations.map(org => `
                        <div class="organization-item" data-id="${org.id}" data-username="${org.username}">
                            <span class="org-name">${org.full_name}</span>
                            <span class="org-username">${org.username}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.node.querySelectorAll('.organization-item').forEach(item => {
            item.addEventListener('click', () => this.handleOrganizationSelect(item));
        });
    }

    protected async handleOrganizationSelect(item: Element): Promise<void> {
        const username = item.getAttribute('data-username');
        if (!username) return;

        localStorage.setItem('dcs.organizationId', username);
        
        const token = localStorage.getItem('dcs.token');
        const apiUrl = localStorage.getItem('dcs.apiUrl');
        
        if (token && apiUrl) {
            await this.initializeProjectManager(token, apiUrl, username);
        }
    }

    protected async initializeProjectManager(token: string, apiUrl: string, organizationId: string): Promise<void> {
        try {
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
            this.messageService.info(`Connected to organization: ${organizationId}`);
            this.renderProjectManager();
        } catch (error) {
            this.messageService.error('Failed to initialize Project Manager');
            console.error('Initialization error:', error);
            this.clearSession();
            this.renderLoginForm();
        }
    }

    protected renderProjectManager(): void {
        // This will be implemented to show projects and resources
        this.node.innerHTML = `
            <div class="project-manager-container">
                <div class="header">
                    <h3>Projects</h3>
                    <button class="theia-button logout-button">Logout</button>
                </div>
                <div class="projects-list">
                    Loading projects...
                </div>
            </div>
        `;

        const logoutButton = this.node.querySelector('.logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.clearSession();
                this.renderLoginForm();
            });
        }

        this.loadProjects();
    }

    protected async loadProjects(): Promise<void> {
        if (!this.projectManager) return;

        try {
            const projects = await this.projectManager.getAllProjects();
            const projectsList = this.node.querySelector('.projects-list');
            if (projectsList) {
                projectsList.innerHTML = projects.length ? projects.map(project => `
                    <div class="project-item" data-id="${project.id}">
                        <div class="project-name">${project.name}</div>
                        <div class="project-status ${project.status}">${project.status}</div>
                    </div>
                `).join('') : '<div class="no-projects">No projects found</div>';
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
            this.messageService.error('Failed to load projects');
        }
    }

    protected toggleLoading(show: boolean): void {
        const form = this.node.querySelector('.login-form');
        const loading = this.node.querySelector('.loading-indicator');
        if (form && loading) {
            form.classList.toggle('hidden', show);
            loading.classList.toggle('hidden', !show);
        }
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.update();
    }
} 