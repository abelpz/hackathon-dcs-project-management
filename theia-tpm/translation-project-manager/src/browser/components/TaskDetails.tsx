import React from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { useNavigation } from '../contexts/NavigationContext';

interface TaskDetailsProps {
    projectId: string;
    milestoneId: string;
    taskId: string;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ projectId, milestoneId, taskId }) => {
    const { projectManager } = useProjectManager();
  const { navigate, goBack } = useNavigation();
  
  console.log({projectManager, navigate})

    return (
        <div className="task-details">
            <div className="details-header">
                <button className="theia-button secondary" onClick={goBack}>
                    ← Back to Milestone
                </button>
                <h3>Task Details</h3>
            </div>
            <div className="details-info">
                <p>Project ID: {projectId}</p>
                <p>Milestone ID: {milestoneId}</p>
                <p>Task ID: {taskId}</p>
            </div>
            <div className="placeholder-message">
                Task details coming soon...
            </div>
        </div>
    );
}; 