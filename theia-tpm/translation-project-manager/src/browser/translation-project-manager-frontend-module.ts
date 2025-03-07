import { ContainerModule } from '@theia/core/shared/inversify';
import { TranslationProjectManagerWidget } from './translation-project-manager-widget';
import { TranslationProjectManagerContribution } from './translation-project-manager-contribution';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bindViewContribution(bind, TranslationProjectManagerContribution);
    bind(FrontendApplicationContribution).toService(TranslationProjectManagerContribution);
    bind(TranslationProjectManagerWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: TranslationProjectManagerWidget.ID,
        createWidget: () => ctx.container.get<TranslationProjectManagerWidget>(TranslationProjectManagerWidget)
    })).inSingletonScope();
});
