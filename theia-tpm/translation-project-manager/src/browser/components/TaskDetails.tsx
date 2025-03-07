import React, { useEffect, useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Task } from '../project-manager';
import { CreateTaskModal } from './CreateTaskModal';

interface TaskDetailsProps {
    projectId: string;
    milestoneId: string;
    taskId: string;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ projectId, milestoneId, taskId }) => {
    const { projectManager } = useProjectManager();
    const { goBack } = useNavigation();
    const [ task, setTask] = useState<Task | null>();
    const [ editView, setEditView ] = useState<boolean>(false);
    const [isLoading, setIsLoading ] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        projectManager?.getTask(taskId, milestoneId, projectId).then((data) => setTask(data))
    }, [])

    const loadProjects = async () => {
        if (!projectManager) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            console.log('Loading tasks...'); // Debug log
            await projectManager?.getTask(taskId, milestoneId, projectId).then((data) => setTask(data))

        } catch (err) {
            console.error('Error loading tasks:', err); // Debug log
            setError(err instanceof Error ? err.message : 'Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-indicator">
                <div className="spinner" />
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }
    
    return (
        <div className="task-details">
            <div className="details-header">
                <button className="theia-button secondary" onClick={goBack}>
                    ← Back to Milestone
                </button>
                <h2>{task?.name}</h2><button className='theia-button primary' onClick={() => { setEditView(!editView) }}>Edit Task</button>
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
            {editView && (
                <CreateTaskModal
                    onClose={() => setEditView(false)}
                    onTaskCreated={() => {
                        setEditView(false);
                        loadProjects();
                    }}
                    currentTaskData={task === null ? undefined : task}
                    milestoneId={milestoneId}
                    projectId={projectId}
                />
            )}
        </div>
    );
}; 