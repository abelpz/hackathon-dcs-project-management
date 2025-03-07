import React, { useEffect, useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Milestone, Project } from '../project-manager';

interface ProjectDetailsProps {
    projectId: string;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId }) => {
    const { projectManager } = useProjectManager();
    const { navigate, goBack } = useNavigation();
    const [ project, setProject ] = useState<Project | null>()
    const [ milestones, setMilestones ] = useState<Array<Milestone | null>>()
  
    useEffect(() => {
        projectManager?.getProject(projectId).then((data) => setProject(data))

        projectManager?.getMilestonesByProject(projectId).then((data) => setMilestones(data))

    }, [])

    const handleProjectClick = (projectId: string, milestoneId: string) => {
        navigate({ type: 'milestone-details', projectId, milestoneId });
    };
    

    return (
        <div className="project-details">
            <div className="details-header">
                <button className="theia-button secondary" onClick={goBack}>
                    ← Back to Projects
                </button>
                <h3>{project?.name}</h3>
            </div>
            <div className="details-info">
                <p>{project?.description}</p>
            </div>
            <h3>Milestones</h3>
            {!milestones?.length ? (
                <div className="no-milestones">No milestones found</div>
            ) : (
                <div className="milestones-list">
                    {milestones?.map(milestone => (
                        <div 
                            key={milestone?.id} 
                            className="project-item"
                            onClick={() => {typeof milestone?.id === 'string' && handleProjectClick(projectId, milestone.id)}}
                        >
                            <div className="project-name">{milestone?.name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 