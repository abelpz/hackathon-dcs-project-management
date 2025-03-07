import React, { useEffect, useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Milestone, Project } from '../project-manager';
import { CreateProjectModal } from './CreateProjectModal';
import { CreateMilestoneModal } from './CreateMilestoneModal';

interface ProjectDetailsProps {
    projectId: string;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId }) => {
    const { projectManager } = useProjectManager();
    const { navigate, goBack } = useNavigation();
    const [ project, setProject ] = useState<Project | null>()
    const [ milestones, setMilestones ] = useState<Array<Milestone | null>>()
    const [ editView, setEditView ] = useState<boolean>(false)
    const [isLoading, setIsLoading ] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
  
    useEffect(() => {
        projectManager?.getProject(projectId).then((data) => setProject(data))

        projectManager?.getMilestonesByProject(projectId).then((data) => setMilestones(data))

    }, [])

    const loadProjects = async () => {
        if (!projectManager) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            console.log('Loading projects...'); // Debug log
            await projectManager?.getProject(projectId).then((data) => setProject(data));
            projectManager?.getMilestonesByProject(projectId).then((data) => setMilestones(data));
        } catch (err) {
            console.error('Error loading projects:', err); // Debug log
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };


    const handleProjectClick = (projectId: string, milestoneId: string) => {
        navigate({ type: 'milestone-details', projectId, milestoneId });
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
        <div className="project-details">
            <div className="details-header">
                <button className="theia-button secondary" onClick={goBack}>
                    ← Back to Projects
                </button>
                <h2>{project?.name}</h2> <button className='theia-button primary' onClick={() => { setEditView(!editView) }}>Edit</button>
            </div>
            <div className="details-info">
                <p>{project?.description}</p>
                <p>{project?.targetResources.join(", ")}</p>
            </div>
            <h3>Milestones</h3>
            <button 
                className="theia-button main" 
                onClick={() => setShowCreateModal(true)}
                >
                Create Milestone
            </button>
            { showCreateModal  &&
            <CreateMilestoneModal
                onClose={() => setShowCreateModal(false)}
                onMilestoneCreated={() => {
                    setShowCreateModal(false);
                    loadProjects();
                }}
                projectId={projectId}
        />
            }
            
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
                {editView && (
                                <CreateProjectModal
                                    onClose={() => setEditView(false)}
                                    onProjectCreated={() => {
                                        setEditView(false);
                                        loadProjects();
                                    }}
                                    currentProjectData={project === null ? undefined : project}
                                />
                            )}
        </div>

    );
}; 