import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { ProjectList } from './ProjectList';
import { ProjectDetails } from './ProjectDetails';
import { MilestoneDetails } from './MilestoneDetails';
import { TaskDetails } from './TaskDetails';

export const MainScreen: React.FC = () => {
    const { currentScreen, goBack, canGoBack } = useNavigation();

    const renderScreen = () => {
        switch (currentScreen.type) {
            case 'projects':
                return <ProjectList />;
            case 'project-details':
                return <ProjectDetails projectId={currentScreen.projectId} />;
            case 'milestone-details':
                return (
                    <MilestoneDetails 
                        projectId={currentScreen.projectId}
                        milestoneId={currentScreen.milestoneId}
                    />
                );
            case 'task-details':
                return (
                    <TaskDetails 
                        projectId={currentScreen.projectId}
                        milestoneId={currentScreen.milestoneId}
                        taskId={currentScreen.taskId}
                    />
                );
        }
    };

    return (
        <div className="main-screen">
            {canGoBack && (
                <div className="screen-header">
                    <button 
                        className="theia-button secondary" 
                        onClick={goBack}
                    >
                        Back
                    </button>
                </div>
            )}
            <div className="screen-content">
                {renderScreen()}
            </div>
        </div>
    );
}; 