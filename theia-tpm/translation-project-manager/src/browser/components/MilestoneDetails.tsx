import React, { useEffect, useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Milestone, Task } from '../project-manager';

interface MilestoneDetailsProps {
    projectId: string;
    milestoneId: string;
}

export const MilestoneDetails: React.FC<MilestoneDetailsProps> = ({ projectId, milestoneId }) => {
    const { projectManager } = useProjectManager();
    const { goBack, navigate } = useNavigation();
    const [ milestone, setMilestone ] = useState<Milestone | null>();
    const [ tasks, setTasks ] = useState<Task[] | null>();


    useEffect(() => {
        projectManager?.getMilestone(milestoneId, projectId).then((data) => {
            if ((data?.name !== undefined) || (data?.name !== null)) {
            setMilestone(data)
        } else {
            throw new Error("Milestone no encontrado")
        }
        })

        projectManager?.getTasksByMilestone(milestoneId, projectId).then((data) => {
        setTasks(data);
        })


    }, [projectManager])

    const handleProjectClick = (projectId: string, milestoneId: string, taskId: string) => {
        navigate({ type: 'task-details', projectId, milestoneId, taskId });
    };

  console.log({tasks})

    return (
        <div className="milestone-details">
            <div className="details-header">
                <button className="theia-button secondary" onClick={goBack}>
                    ← Back to Project
                </button>
                <h3>{milestone?.name}</h3>
            </div>
            <div className="details-info">
                <p>Project ID: {projectId}</p>
                <p>Milestone ID: {milestoneId}</p>
            </div>
            <div className="placeholder-message">
                Milestone details coming soon...
            </div>
            <h3>Tareas</h3>
            {!tasks?.length ? (
                <div className="no-tasks">No tasks found</div>
            ) : (
                <div className="tasks-list">
                    {tasks?.map(tasks => (
                        <div 
                            key={tasks?.id} 
                            className="project-item"
                            onClick={() => {typeof tasks?.id === 'string' && handleProjectClick(projectId, milestoneId, tasks?.id)}}
                        >
                            <div className="project-name">{tasks?.name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 