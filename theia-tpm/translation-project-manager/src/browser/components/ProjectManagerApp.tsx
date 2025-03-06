import React from 'react';
import { MessageService } from '@theia/core';
import { ProjectManagerProvider } from '../contexts/ProjectManagerContext';
import { LoginForm } from './LoginForm';
import { OrganizationSelector } from './OrganizationSelector';
import { ProjectList } from './ProjectList';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { ProjectManagerService } from '../project-manager-service';

const ProjectManagerContent: React.FC = () => {
    const { isAuthenticated, projectManager, logout } = useProjectManager();

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    if (!projectManager) {
        return <OrganizationSelector />;
    }

    return (
        <div className="project-manager-container">
            <div className="header">
                <h3>Projects</h3>
                <button className="theia-button logout-button" onClick={logout}>
                    Logout
                </button>
            </div>
            <ProjectList />
        </div>
    );
};

interface ProjectManagerAppProps {
    messageService: MessageService;
    projectManagerService: ProjectManagerService;
}

export const ProjectManagerApp: React.FC<ProjectManagerAppProps> = ({ messageService, projectManagerService }) => {
    return (
        <ProjectManagerProvider 
            messageService={messageService}
            projectManagerService={projectManagerService}
        >
            <ProjectManagerContent />
        </ProjectManagerProvider>
    );
}; 