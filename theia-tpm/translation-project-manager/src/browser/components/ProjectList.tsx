import React, { useEffect, useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { CreateProjectModal } from './CreateProjectModal';

interface Project {
    id: string;
    name: string;
    status: string;
}

export const ProjectList: React.FC = () => {
    const { projectManager } = useProjectManager();
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
                <h3>My Projects</h3>
                <button 
                    className="theia-button main" 
                    onClick={() => setShowCreateModal(true)}
                >
                    Create Project
                </button>
            </div>
            
            {!projects.length ? (
                <div className="no-projects">No projects found</div>
            ) : (
                <div className="projects-list">
                    {projects.map(project => (
                        <div key={project.id} className="project-item">
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