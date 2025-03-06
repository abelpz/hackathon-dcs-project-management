import React from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { useNavigation } from '../contexts/NavigationContext';

interface ProjectDetailsProps {
    projectId: string;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId }) => {
    const { projectManager } = useProjectManager();
  const { navigate, goBack } = useNavigation();
  
  console.log({navigate, projectManager})

    return (
        <div className="project-details">
            <div className="details-header">
                <button className="theia-button secondary" onClick={goBack}>
                    ← Back to Projects
                </button>
                <h3>Project Details</h3>
            </div>
            <div className="details-info">
                <p>Project ID: {projectId}</p>
            </div>
            <div className="placeholder-message">
                Project details coming soon...
            </div>
        </div>
    );
}; 