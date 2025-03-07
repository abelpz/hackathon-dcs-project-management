import React from 'react';
import { MessageService } from '@theia/core';
import { ProjectManagerProvider } from '../contexts/ProjectManagerContext';
import { NavigationProvider } from '../contexts/NavigationContext';
import { LoginForm } from './LoginForm';
import { OrganizationSelector } from './OrganizationSelector';
import { MainScreen } from './MainScreen';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { ProjectManagerService } from '../project-manager-service';

const ProjectManagerContent: React.FC = () => {
    const { isAuthenticated, projectManager } = useProjectManager();

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    if (!projectManager) {
        return <OrganizationSelector />;
    }

    return <MainScreen />;
};

interface ProjectManagerAppProps {
    messageService: MessageService;
    projectManagerService: ProjectManagerService;
}

export const ProjectManagerApp: React.FC<ProjectManagerAppProps> = ({ messageService, projectManagerService }) => {
    return (
        <NavigationProvider>
            <ProjectManagerProvider 
                messageService={messageService}
                projectManagerService={projectManagerService}
            >
                <ProjectManagerContent />
            </ProjectManagerProvider>
        </NavigationProvider>
    );
}; 