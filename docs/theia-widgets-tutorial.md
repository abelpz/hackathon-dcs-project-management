# Building Theia Widgets with ProjectManager

This tutorial demonstrates how to create Eclipse Theia widgets that integrate with ProjectManager and DCSStorageService, following Theia's design patterns and best practices.

## Widget Overview

We'll create the following widgets to provide a comprehensive project management experience:

1. **Project Explorer Widget**
   - Tree view of projects and their resources
   - Context menu actions
   - Resource filtering and search

2. **Project Details Widget**
   - Project information and status
   - Milestone progress tracking
   - Team member assignments

3. **Task Board Widget**
   - Kanban-style task management
   - Drag-and-drop task organization
   - Task filtering and search

4. **Resource Browser Widget**
   - Resource file browsing
   - Preview capabilities
   - Version history

## Setup

### 1. Dependencies

Add the required dependencies to your `package.json`:

```json
{
  "dependencies": {
    "@theia/core": "latest",
    "@theia/editor": "latest",
    "@theia/filesystem": "latest",
    "@theia/navigator": "latest",
    "@theia/workspace": "latest",
    "@core/project-manager": "latest",
    "inversify": "latest"
  }
}
```

### 2. Module Configuration

Create a module file `src/browser/project-manager-frontend-module.ts`:

```typescript
import { ContainerModule } from 'inversify';
import { WidgetFactory } from '@theia/core/lib/browser';
import { ProjectExplorerWidget } from './widgets/project-explorer-widget';
import { ProjectDetailsWidget } from './widgets/project-details-widget';
import { TaskBoardWidget } from './widgets/task-board-widget';
import { ResourceBrowserWidget } from './widgets/resource-browser-widget';
import { ProjectManagerContribution } from './project-manager-contribution';
import { bindProjectManagerService } from './project-manager-service';

export default new ContainerModule(bind => {
    bindProjectManagerService(bind);
    
    bind(ProjectManagerContribution).toSelf().inSingletonScope();
    
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: ProjectExplorerWidget.ID,
        createWidget: () => ctx.container.get(ProjectExplorerWidget)
    })).inSingletonScope();

    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: ProjectDetailsWidget.ID,
        createWidget: () => ctx.container.get(ProjectDetailsWidget)
    })).inSingletonScope();

    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: TaskBoardWidget.ID,
        createWidget: () => ctx.container.get(TaskBoardWidget)
    })).inSingletonScope();

    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: ResourceBrowserWidget.ID,
        createWidget: () => ctx.container.get(ResourceBrowserWidget)
    })).inSingletonScope();
});
```

### 3. Service Integration

Create a service wrapper `src/browser/project-manager-service.ts`:

```typescript
import { injectable, inject } from 'inversify';
import { MessageService } from '@theia/core';
import { ProjectManager, DCSStorageService } from '@core/project-manager';

@injectable()
export class ProjectManagerService {
    @inject(MessageService)
    protected readonly messageService: MessageService;

    private projectManager: ProjectManager;

    constructor() {
        const storageService = new DCSStorageService();
        this.projectManager = new ProjectManager(storageService, {
            organizationId: 'your-org-id'
        });
    }

    async initialize(): Promise<void> {
        try {
            await this.projectManager.initialize();
        } catch (error) {
            this.messageService.error('Failed to initialize Project Manager');
            throw error;
        }
    }

    getProjectManager(): ProjectManager {
        return this.projectManager;
    }
}

export const bindProjectManagerService = (bind: interfaces.Bind) => {
    bind(ProjectManagerService).toSelf().inSingletonScope();
};
```

## DCS Authentication and Organization Selection

### 1. DCS Login Widget

Update the login widget with improved widget management and security:

```typescript
import { injectable, inject } from 'inversify';
import { BaseWidget, Message, WidgetManager } from '@theia/core/lib/browser';
import { MessageService } from '@theia/core';
import { getToken } from '@core/authentication';
import { OrganizationSelectorWidget } from './organization-selector-widget';

@injectable()
export class DCSLoginWidget extends BaseWidget {
    static ID = 'dcs-login';
    
    @inject(MessageService)
    protected readonly messageService: MessageService;

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    protected loginForm: HTMLFormElement;
    protected loadingIndicator: HTMLDivElement;

    constructor() {
        super();
        this.id = DCSLoginWidget.ID;
        this.title.label = 'DCS Login';
        this.title.closable = true;
        this.title.iconClass = 'fa fa-sign-in-alt';
        this.addClass('dcs-login');
        
        this.createLoginForm();
        this.checkExistingSession();
    }

    protected async checkExistingSession(): Promise<void> {
        const token = this.getStoredToken();
        const apiUrl = localStorage.getItem('dcs.apiUrl');
        const organizationId = localStorage.getItem('dcs.organizationId');

        if (token && apiUrl && organizationId) {
            try {
                // Validate token
                const response = await fetch(`${apiUrl}/user`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    await this.handleSuccessfulLogin(token, apiUrl);
                    return;
                }
            } catch (error) {
                console.error('Session validation error:', error);
            }
            // Clear invalid session
            this.clearSession();
        }
    }

    protected createLoginForm(): void {
        this.loginForm = document.createElement('form');
        this.loginForm.className = 'dcs-login-form';
        this.loginForm.innerHTML = `
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
        `;

        this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        this.node.appendChild(this.loginForm);

        // Add loading indicator
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'loading-indicator hidden';
        this.loadingIndicator.innerHTML = '<div class="spinner"></div>';
        this.node.appendChild(this.loadingIndicator);
    }

    protected async handleLogin(event: Event): Promise<void> {
        event.preventDefault();
        this.showLoading(true);

        const formData = new FormData(this.loginForm);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const apiUrl = formData.get('apiUrl') as string;

        try {
            const token = await this.retryOperation(() => getToken(username, password));
            await this.handleSuccessfulLogin(token, apiUrl);
        } catch (error) {
            this.handleLoginError(error);
        } finally {
            this.showLoading(false);
        }
    }

    protected async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                    continue;
                }
            }
        }
        
        throw lastError || new Error('Operation failed after max retries');
    }

    protected handleLoginError(error: unknown): void {
        let message = 'Login failed. Please check your credentials.';
        
        if (error instanceof Error) {
            if (error.message.includes('401')) {
                message = 'Invalid username or password';
            } else if (error.message.includes('404')) {
                message = 'DCS API endpoint not found';
            } else if (error.message.includes('Network')) {
                message = 'Network error. Please check your connection';
            }
        }
        
        this.messageService.error(message);
        console.error('Login error:', error);
    }

    protected async handleSuccessfulLogin(token: string, apiUrl: string): Promise<void> {
        this.storeToken(token);
        localStorage.setItem('dcs.apiUrl', apiUrl);
        
        await this.openOrganizationSelector(token, apiUrl);
        this.close();
    }

    protected async openOrganizationSelector(token: string, apiUrl: string): Promise<void> {
        const widget = await this.widgetManager.getOrCreateWidget<OrganizationSelectorWidget>(
            OrganizationSelectorWidget.ID
        );
        
        if (!widget.isAttached) {
            this.shell.addWidget(widget, { area: 'main' });
        }
        
        await widget.initialize(token, apiUrl);
        this.shell.activateWidget(widget.id);
    }

    protected storeToken(token: string): void {
        // In a production environment, consider using a more secure storage method
        const encryptedToken = this.encryptToken(token);
        localStorage.setItem('dcs.token', encryptedToken);
    }

    protected getStoredToken(): string | null {
        const encryptedToken = localStorage.getItem('dcs.token');
        return encryptedToken ? this.decryptToken(encryptedToken) : null;
    }

    protected encryptToken(token: string): string {
        // Implement proper encryption in production
        return btoa(token);
    }

    protected decryptToken(encryptedToken: string): string {
        // Implement proper decryption in production
        return atob(encryptedToken);
    }

    protected clearSession(): void {
        localStorage.removeItem('dcs.token');
        localStorage.removeItem('dcs.apiUrl');
        localStorage.removeItem('dcs.organizationId');
    }

    protected showLoading(show: boolean): void {
        this.loadingIndicator.classList.toggle('hidden', !show);
        this.loginForm.classList.toggle('hidden', show);
    }
}
```

Add loading indicator styles:

```css
.dcs-login .loading-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
}

.dcs-login .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--theia-border-color);
    border-top-color: var(--theia-brand-color0);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.dcs-login .hidden {
    display: none;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

### 2. Organization Selection Widget

Create an organization selection widget `src/browser/widgets/organization-selector-widget.ts`:

```typescript
import { injectable, inject } from 'inversify';
import { BaseWidget, Message } from '@theia/core/lib/browser';
import { MessageService } from '@theia/core';
import { ProjectManagerService } from '../project-manager-service';

interface Organization {
    id: number;
    username: string;
    full_name: string;
}

@injectable()
export class OrganizationSelectorWidget extends BaseWidget {
    static ID = 'organization-selector';
    
    @inject(MessageService)
    protected readonly messageService: MessageService;

    @inject(ProjectManagerService)
    protected readonly projectManager: ProjectManagerService;

    protected organizations: Organization[] = [];

    constructor() {
        super();
        this.id = OrganizationSelectorWidget.ID;
        this.title.label = 'Select Organization';
        this.title.closable = true;
        this.title.iconClass = 'fa fa-building';
        this.addClass('organization-selector');
    }

    async initialize(token: string, apiUrl: string): Promise<void> {
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
            this.render();
        } catch (error) {
            this.messageService.error('Failed to load organizations');
            console.error('Organization loading error:', error);
        }
    }

    protected render(): void {
        this.node.innerHTML = `
            <div class="organization-list">
                <h3>Select an Organization</h3>
                <div class="organizations">
                    ${this.organizations.map(org => `
                        <div class="organization-item" data-id="${org.id}">
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
        const orgId = item.getAttribute('data-id');
        const org = this.organizations.find(o => o.id.toString() === orgId);
        
        if (org) {
            localStorage.setItem('dcs.organizationId', org.username);
            
            // Initialize ProjectManager with selected organization
            await this.initializeProjectManager(
                localStorage.getItem('dcs.token')!,
                localStorage.getItem('dcs.apiUrl')!,
                org.username
            );
            
            // Close the widget
            this.close();
        }
    }

    protected async initializeProjectManager(token: string, apiUrl: string, organizationId: string): Promise<void> {
        try {
            await this.projectManager.initialize({
                token,
                apiUrl,
                organizationId
            });
            
            this.messageService.info(`Connected to organization: ${organizationId}`);
        } catch (error) {
            this.messageService.error('Failed to initialize Project Manager');
            console.error('Initialization error:', error);
        }
    }
}
```

### 3. Update ProjectManagerService

Update the `ProjectManagerService` to handle authentication and organization selection:

```typescript
// src/browser/project-manager-service.ts
@injectable()
export class ProjectManagerService {
    @inject(MessageService)
    protected readonly messageService: MessageService;

    private projectManager: ProjectManager | undefined;

    async initialize(config: { token: string; apiUrl: string; organizationId: string }): Promise<void> {
        try {
            const storageService = new DCSStorageService();
            storageService.setConfig({
                token: config.token,
                apiUrl: config.apiUrl,
                organizationId: config.organizationId
            });

            this.projectManager = new ProjectManager(storageService, {
                organizationId: config.organizationId
            });

            await this.projectManager.initialize();
        } catch (error) {
            this.messageService.error('Failed to initialize Project Manager');
            throw error;
        }
    }

    getProjectManager(): ProjectManager {
        if (!this.projectManager) {
            throw new Error('ProjectManager not initialized. Please login first.');
        }
        return this.projectManager;
    }

    isInitialized(): boolean {
        return !!this.projectManager;
    }
}
```

### 4. Add Styling

Add styles for the new widgets in `src/browser/style/index.css`:

```css
/* DCS Login Widget */
.dcs-login {
    padding: 20px;
    max-width: 400px;
    margin: 0 auto;
}

.dcs-login-form .form-group {
    margin-bottom: 16px;
}

.dcs-login-form label {
    display: block;
    margin-bottom: 4px;
}

.dcs-login-form input {
    width: 100%;
    padding: 8px;
}

/* Organization Selector Widget */
.organization-selector {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
}

.organization-list h3 {
    margin-bottom: 16px;
}

.organization-item {
    padding: 12px;
    border: 1px solid var(--theia-border-color);
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.organization-item:hover {
    background-color: var(--theia-selection-background);
}

.org-name {
    font-weight: bold;
}

.org-username {
    color: var(--theia-descriptionForeground);
}
```

### 5. Update Module Configuration

Update the module configuration to include the new widgets:

```typescript
// src/browser/project-manager-frontend-module.ts
export default new ContainerModule(bind => {
    // ... existing bindings ...

    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: DCSLoginWidget.ID,
        createWidget: () => ctx.container.get(DCSLoginWidget)
    })).inSingletonScope();

    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: OrganizationSelectorWidget.ID,
        createWidget: () => ctx.container.get(OrganizationSelectorWidget)
    })).inSingletonScope();
});
```

### 6. Add Authentication Commands

Add authentication-related commands to `ProjectManagerContribution`:

```typescript
// src/browser/project-manager-contribution.ts
@injectable()
export class ProjectManagerContribution implements CommandContribution, MenuContribution {
    // ... existing code ...

    registerCommands(commands: CommandRegistry): void {
        // ... existing commands ...

        commands.registerCommand({
            id: 'dcs:login',
            label: 'DCS: Login'
        }, {
            execute: () => {
                // Open login widget
                const widget = this.widgetManager.getOrCreateWidget(DCSLoginWidget.ID);
                this.shell.addWidget(widget, { area: 'main' });
                this.shell.activateWidget(widget.id);
            }
        });

        commands.registerCommand({
            id: 'dcs:logout',
            label: 'DCS: Logout'
        }, {
            execute: () => {
                localStorage.removeItem('dcs.token');
                localStorage.removeItem('dcs.apiUrl');
                localStorage.removeItem('dcs.organizationId');
                this.messageService.info('Logged out successfully');
            }
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        // ... existing menu items ...

        menus.registerSubmenu(DCS_MENU, 'DCS');
        
        menus.registerMenuAction(DCS_MENU, {
            commandId: 'dcs:login',
            label: 'Login'
        });

        menus.registerMenuAction(DCS_MENU, {
            commandId: 'dcs:logout',
            label: 'Logout'
        });
    }
}
```

## Widget Implementations

### 1. Project Explorer Widget

```typescript
// src/browser/widgets/project-explorer-widget.ts
import { injectable, inject } from 'inversify';
import { TreeWidget, TreeNode, TreeModel } from '@theia/core/lib/browser';
import { ProjectManagerService } from '../project-manager-service';
import { Project } from '@core/project-manager/models';

@injectable()
export class ProjectExplorerWidget extends TreeWidget {
    static ID = 'project-explorer';
    static LABEL = 'Projects';

    @inject(ProjectManagerService)
    protected readonly projectManager: ProjectManagerService;

    constructor() {
        super({
            tree: new TreeModel(),
            contextMenuPath: ['project-context-menu']
        });

        this.id = ProjectExplorerWidget.ID;
        this.title.label = ProjectExplorerWidget.LABEL;
        this.title.caption = ProjectExplorerWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-folder';

        this.initializeModel();
    }

    protected async initializeModel(): Promise<void> {
        const projects = await this.projectManager.getProjectManager().getAllProjects();
        const nodes = this.createProjectNodes(projects);
        this.model.root = {
            id: 'project-root',
            name: 'Projects',
            visible: false,
            children: nodes,
            parent: undefined
        };
    }

    protected createProjectNodes(projects: Project[]): TreeNode[] {
        return projects.map(project => ({
            id: project.id,
            name: project.name,
            icon: 'fa fa-project-diagram',
            selected: false,
            expanded: false,
            children: [],
            parent: undefined
        }));
    }

    protected async handleProjectClick(projectId: string): Promise<void> {
        // Open project details widget
        // Implement command handling
    }
}
```

### 2. Project Details Widget

```typescript
// src/browser/widgets/project-details-widget.ts
import { injectable, inject } from 'inversify';
import { BaseWidget } from '@theia/core/lib/browser';
import { ProjectManagerService } from '../project-manager-service';

@injectable()
export class ProjectDetailsWidget extends BaseWidget {
    static ID = 'project-details';
    
    @inject(ProjectManagerService)
    protected readonly projectManager: ProjectManagerService;

    protected currentProjectId: string | undefined;

    constructor() {
        super();
        this.id = ProjectDetailsWidget.ID;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-info-circle';
        this.addClass('project-details');
    }

    async updateContent(projectId: string): Promise<void> {
        this.currentProjectId = projectId;
        const project = await this.projectManager.getProjectManager().getProject(projectId);
        
        if (!project) {
            this.node.innerHTML = 'Project not found';
            return;
        }

        this.title.label = `Project: ${project.name}`;
        this.renderProject(project);
    }

    protected renderProject(project: Project): void {
        this.node.innerHTML = `
            <div class="project-header">
                <h2>${project.name}</h2>
                <div class="project-status ${project.status}">${project.status}</div>
            </div>
            <div class="project-content">
                <div class="project-description">${project.description || ''}</div>
                <div class="project-resources">
                    <h3>Resources</h3>
                    <div class="source-resources">
                        <h4>Source</h4>
                        ${this.renderResourceList(project.sourceResources)}
                    </div>
                    <div class="target-resources">
                        <h4>Target</h4>
                        ${this.renderResourceList(project.targetResources)}
                    </div>
                </div>
            </div>
        `;
    }

    protected renderResourceList(resources: string[]): string {
        return `
            <ul class="resource-list">
                ${resources.map(r => `<li>${r}</li>`).join('')}
            </ul>
        `;
    }
}
```

### 3. Task Board Widget

```typescript
// src/browser/widgets/task-board-widget.ts
import { injectable, inject } from 'inversify';
import { BaseWidget } from '@theia/core/lib/browser';
import { ProjectManagerService } from '../project-manager-service';
import { Task } from '@core/project-manager/models';

@injectable()
export class TaskBoardWidget extends BaseWidget {
    static ID = 'task-board';

    @inject(ProjectManagerService)
    protected readonly projectManager: ProjectManagerService;

    constructor() {
        super();
        this.id = TaskBoardWidget.ID;
        this.title.label = 'Task Board';
        this.title.closable = true;
        this.title.iconClass = 'fa fa-tasks';
        this.addClass('task-board');

        this.node.tabIndex = 0; // Make widget focusable
        this.initializeDragAndDrop();
    }

    protected initializeDragAndDrop(): void {
        this.node.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.node.addEventListener('dragover', this.handleDragOver.bind(this));
        this.node.addEventListener('drop', this.handleDrop.bind(this));
    }

    async updateContent(milestoneId: string): Promise<void> {
        const tasks = await this.projectManager.getProjectManager().getTasksByMilestone(milestoneId);
        this.renderTaskBoard(tasks);
    }

    protected renderTaskBoard(tasks: Task[]): void {
        const columns = {
            open: tasks.filter(t => t.status === 'open'),
            inProgress: tasks.filter(t => t.status === 'in-progress'),
            closed: tasks.filter(t => t.status === 'closed')
        };

        this.node.innerHTML = `
            <div class="task-board-columns">
                ${this.renderColumn('Open', columns.open)}
                ${this.renderColumn('In Progress', columns.inProgress)}
                ${this.renderColumn('Completed', columns.closed)}
            </div>
        `;
    }

    protected renderColumn(title: string, tasks: Task[]): string {
        return `
            <div class="task-column" data-status="${title.toLowerCase()}">
                <h3>${title}</h3>
                <div class="task-list">
                    ${tasks.map(task => this.renderTaskCard(task)).join('')}
                </div>
            </div>
        `;
    }

    protected renderTaskCard(task: Task): string {
        return `
            <div class="task-card" 
                 draggable="true" 
                 data-task-id="${task.id}">
                <div class="task-header">
                    <span class="task-name">${task.name}</span>
                    <span class="task-status">${task.status}</span>
                </div>
                <div class="task-description">${task.description || ''}</div>
                <div class="task-footer">
                    <span class="task-resource">${task.resourceId}</span>
                    <span class="task-assignees">
                        ${task.assignedUserIds.length} assignees
                    </span>
                </div>
            </div>
        `;
    }
}
```

### 4. Resource Browser Widget

```typescript
// src/browser/widgets/resource-browser-widget.ts
import { injectable, inject } from 'inversify';
import { TreeWidget, TreeNode } from '@theia/core/lib/browser';
import { ProjectManagerService } from '../project-manager-service';
import { Resource } from '@core/project-manager/models';

@injectable()
export class ResourceBrowserWidget extends TreeWidget {
    static ID = 'resource-browser';

    @inject(ProjectManagerService)
    protected readonly projectManager: ProjectManagerService;

    constructor() {
        super({
            tree: new TreeModel(),
            contextMenuPath: ['resource-context-menu']
        });

        this.id = ResourceBrowserWidget.ID;
        this.title.label = 'Resources';
        this.title.closable = true;
        this.title.iconClass = 'fa fa-archive';
    }

    async updateContent(projectId: string): Promise<void> {
        const project = await this.projectManager.getProjectManager().getProject(projectId);
        if (!project) return;

        const resources = [
            ...await Promise.all(project.sourceResources.map(id => 
                this.projectManager.getProjectManager().getResource(id)
            )),
            ...await Promise.all(project.targetResources.map(id => 
                this.projectManager.getProjectManager().getResource(id)
            ))
        ].filter(Boolean) as Resource[];

        this.model.root = this.createResourceTree(resources);
    }

    protected createResourceTree(resources: Resource[]): TreeNode {
        return {
            id: 'resource-root',
            name: 'Resources',
            visible: false,
            children: resources.map(resource => ({
                id: resource.id,
                name: resource.name,
                icon: this.getResourceIcon(resource.contentType),
                selected: false,
                expanded: false,
                children: [],
                parent: undefined
            })),
            parent: undefined
        };
    }

    protected getResourceIcon(contentType: string): string {
        // Map content types to appropriate icons
        const iconMap: Record<string, string> = {
            'text/markdown': 'fa fa-file-alt',
            'text/plain': 'fa fa-file-text',
            'application/json': 'fa fa-file-code',
            // Add more mappings as needed
        };
        return iconMap[contentType] || 'fa fa-file';
    }
}
```

## Styling

Create a styles file `src/browser/style/index.css`:

```css
/* Project Explorer */
.project-explorer {
    height: 100%;
    overflow: auto;
}

.project-explorer .theia-TreeNode {
    padding: 4px;
}

/* Project Details */
.project-details {
    padding: 16px;
}

.project-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.project-status {
    padding: 4px 8px;
    border-radius: 4px;
    text-transform: capitalize;
}

.project-status.active { background: var(--theia-success-color); }
.project-status.complete { background: var(--theia-info-color); }
.project-status.archived { background: var(--theia-warn-color); }

/* Task Board */
.task-board {
    height: 100%;
    overflow: auto;
    padding: 16px;
}

.task-board-columns {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    height: 100%;
}

.task-column {
    background: var(--theia-editor-background);
    border-radius: 4px;
    padding: 8px;
}

.task-card {
    background: var(--theia-editor-background);
    border: 1px solid var(--theia-border-color);
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 8px;
    cursor: move;
}

/* Resource Browser */
.resource-browser {
    height: 100%;
    overflow: auto;
}

.resource-browser .theia-TreeNode {
    padding: 4px;
}
```

## Commands and Menu Contributions

Create a contribution file `src/browser/project-manager-contribution.ts`:

```typescript
import { injectable, inject } from 'inversify';
import { CommandContribution, MenuContribution, CommandRegistry, MenuModelRegistry } from '@theia/core';
import { CommonMenus } from '@theia/core/lib/browser';
import { ProjectManagerService } from './project-manager-service';

@injectable()
export class ProjectManagerContribution implements CommandContribution, MenuContribution {
    @inject(ProjectManagerService)
    protected readonly projectManager: ProjectManagerService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand({
            id: 'project-explorer:open',
            label: 'Open Project Explorer'
        }, {
            execute: () => {
                // Open project explorer widget
            }
        });

        // Add more commands
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.VIEW, {
            commandId: 'project-explorer:open',
            label: 'Project Explorer'
        });

        // Add more menu items
    }
}
```

## Best Practices

1. **Widget Communication**
   - Use commands for widget-to-widget communication
   - Implement proper event handling
   - Use widget state management

2. **Performance**
   - Implement lazy loading for large data sets
   - Use virtual scrolling for long lists
   - Cache widget state appropriately

3. **Error Handling**
   - Show appropriate error messages
   - Implement retry mechanisms
   - Use error boundaries

4. **Accessibility**
   - Implement keyboard navigation
   - Add ARIA labels
   - Follow Theia accessibility guidelines

5. **Theming**
   - Use Theia CSS variables
   - Support both light and dark themes
   - Follow Theia styling conventions

## Testing

Example of testing a widget:

```typescript
// src/browser/widgets/__tests__/project-explorer-widget.test.ts
import { Container } from 'inversify';
import { ProjectExplorerWidget } from '../project-explorer-widget';
import { ProjectManagerService } from '../../project-manager-service';

describe('ProjectExplorerWidget', () => {
    let container: Container;
    let widget: ProjectExplorerWidget;

    beforeEach(() => {
        container = new Container();
        container.bind(ProjectManagerService).toSelf().inSingletonScope();
        container.bind(ProjectExplorerWidget).toSelf();
        widget = container.get(ProjectExplorerWidget);
    });

    it('should create project nodes', async () => {
        await widget.initializeModel();
        expect(widget.model.root).toBeDefined();
    });
}); 