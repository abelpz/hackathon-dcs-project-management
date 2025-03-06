import * as React from 'react';
import { BaseWidget } from '@theia/core/lib/browser';
import { injectable } from 'inversify';
import { inject } from 'inversify';
import { MessageService } from '@theia/core/lib/common/message-service';
import { createRoot } from 'react-dom/client';
import { ProjectManagerApp } from './components/ProjectManagerApp';
import { ProjectManagerService, ProjectManagerServiceSymbol } from './project-manager-service';

@injectable()
export class ProjectManagerWidget extends BaseWidget {
    static readonly ID = 'project-manager-widget';
    static readonly LABEL = 'Project Manager';

    protected readonly messageService: MessageService;
    protected readonly projectManagerService: ProjectManagerService;

    constructor(
        @inject(MessageService) messageService: MessageService,
        @inject(ProjectManagerServiceSymbol) projectManagerService: ProjectManagerService
    ) {
        super();
        this.messageService = messageService;
        this.projectManagerService = projectManagerService;
        this.id = ProjectManagerWidget.ID;
        this.title.label = ProjectManagerWidget.LABEL;
        this.title.caption = ProjectManagerWidget.LABEL;
        this.title.closable = false;
        this.title.iconClass = 'fa fa-project-diagram';
        this.addClass('project-manager-widget');
    }

    protected onAfterAttach(): void {
        if (!this.isAttached) {
            return;
        }
        
        const root = createRoot(this.node);
        root.render(
            <ProjectManagerApp 
                messageService={this.messageService}
                projectManagerService={this.projectManagerService}
            />
        );
    }

    protected onBeforeDetach(): void {
        // React will handle cleanup
    }
} 