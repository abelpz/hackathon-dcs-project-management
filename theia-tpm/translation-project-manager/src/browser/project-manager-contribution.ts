import { AbstractViewContribution } from '@theia/core/lib/browser';
import { injectable } from '@theia/core/shared/inversify';
import { ProjectManagerWidget } from './project-manager-widget';
import { Command, CommandRegistry } from '@theia/core/lib/common/command';

export const ProjectManagerCommand: Command = {
    id: 'project-manager:toggle',
    label: 'Toggle Project Manager'
};

@injectable()
export class ProjectManagerContribution extends AbstractViewContribution<ProjectManagerWidget> {
    constructor() {
        super({
            widgetId: ProjectManagerWidget.ID,
            widgetName: ProjectManagerWidget.LABEL,
            defaultWidgetOptions: {
                area: 'left',
                rank: 1000
            },
            toggleCommandId: ProjectManagerCommand.id,
            toggleKeybinding: 'ctrlcmd+shift+p'
        });
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(ProjectManagerCommand, {
            execute: () => super.openView({ reveal: true })
        });
    }
} 