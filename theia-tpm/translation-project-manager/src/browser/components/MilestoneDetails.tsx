import React from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { useNavigation } from '../contexts/NavigationContext';

interface MilestoneDetailsProps {
    projectId: string;
    milestoneId: string;
}

export const MilestoneDetails: React.FC<MilestoneDetailsProps> = ({ projectId, milestoneId }) => {
    const { projectManager } = useProjectManager();
    const { navigate, goBack } = useNavigation();
  
    if (!projectManager) {
        return <div>Loading...</div>;
    }

    const milestone = projectManager.getMilestone(projectId);

    if (!milestone) {
        return <div>Milestone not found</div>;
  }
  
  console.log({projectManager, navigate})

    return (
        <div className="milestone-details">
            <div className="details-header">
                <button className="theia-button secondary" onClick={goBack}>
                    ← Back to Project
                </button>
                <h3>Milestone Details</h3>
            </div>
            <div className="details-info">
                <p>Project ID: {projectId}</p>
                <p>Milestone ID: {milestoneId}</p>
            </div>
            <div className="placeholder-message">
                Milestone details coming soon...
            </div>
        </div>
    );
}; 