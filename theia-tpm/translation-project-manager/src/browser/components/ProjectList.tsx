import React, { useEffect, useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { useNavigation } from '../contexts/NavigationContext';
import { CreateProjectModal } from './CreateProjectModal';

interface Project {
    id: string;
    name: string;
    status: string;
}

export const ProjectList: React.FC = () => {
    const { projectManager, logout } = useProjectManager();
    const { navigate } = useNavigation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const loadProjects = async () => {
        if (!projectManager) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            console.log('Loading projects...'); // Debug log
            const projectList = await projectManager.getAllProjects();
            console.log('Projects loaded:', projectList); // Debug log
            setProjects(Array.isArray(projectList) ? projectList : []);
        } catch (err) {
            console.error('Error loading projects:', err); // Debug log
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, [projectManager]);

    const handleProjectClick = (projectId: string) => {
        navigate({ type: 'project-details', projectId });
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
        <div className="project-manager-content">
            <div className="project-list-header">
                <div className="header-left">
                    <h3>Projectdwadaws</h3>
                    <button 
                        className="theia-button main" 
                        onClick={() => setShowCreateModal(true)}
                    >
                        Create Project
                    </button>
                    <button 
                        className="theia-button main" 
                        onClick={() => navigate({type: "milestone-details", projectId: "project-1741286121316-y7yhuubq6", milestoneId: "milestone-1741286372389-3gjz19vf8"})}
                    >
                        View Milestone
                    </button>
                </div>
                <button className="theia-button secondary" onClick={logout}>
                    Logout
                </button>
            </div>
            
            {!projects.length ? (
                <div className="no-projects">No projects found</div>
            ) : (
                <div className="projects-list">
                    {projects.map(project => (
                        <div 
                            key={project.id} 
                            className="project-item"
                            onClick={() => handleProjectClick(project.id)}
                        >
                            <div className="project-name">{project.name}</div>
                            <div className={`project-status ${project.status}`}>
                                {project.status}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onProjectCreated={() => {
                        setShowCreateModal(false);
                        loadProjects();
                    }}
                />
            )}
        </div>
    );
}; 