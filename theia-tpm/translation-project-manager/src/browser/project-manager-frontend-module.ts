import { ContainerModule } from '@theia/core/shared/inversify';
import { ProjectManagerWidget } from './project-manager-widget';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import { ProjectManagerContribution } from './project-manager-contribution';
import { ProjectManagerServiceImpl, ProjectManagerServiceSymbol } from './project-manager-service';

import '../../src/browser/style/project-manager-widget.css';

export default new ContainerModule(bind => {
    bind(ProjectManagerServiceSymbol).to(ProjectManagerServiceImpl).inSingletonScope();
    
    bindViewContribution(bind, ProjectManagerContribution);
    bind(FrontendApplicationContribution).toService(ProjectManagerContribution);
    bind(ProjectManagerWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: ProjectManagerWidget.ID,
        createWidget: () => ctx.container.get<ProjectManagerWidget>(ProjectManagerWidget)
    })).inSingletonScope();
}); 