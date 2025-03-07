import React, { useEffect, useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Task } from '../project-manager';

interface TaskDetailsProps {
    projectId: string;
    milestoneId: string;
    taskId: string;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ projectId, milestoneId, taskId }) => {
    const { projectManager } = useProjectManager();
    const { navigate, goBack } = useNavigation();
    const [ task, setTask] = useState<Task | null>();

    useEffect(() => {
        projectManager?.getTask(taskId, milestoneId, projectId).then((data) => setTask(data))
    }, [])
  
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
                <h4>{task?.name}</h4>  
                <p>Project ID: {projectId}</p>
                <p>Milestone ID: {milestoneId}</p>
                <p>Task ID: {taskId}</p>
            </div>
            <div className="placeholder-message">
                <p>Description: {task?.description}</p>
                <p>Status: {task?.status}</p>
            </div>
        </div>
    );
}; 