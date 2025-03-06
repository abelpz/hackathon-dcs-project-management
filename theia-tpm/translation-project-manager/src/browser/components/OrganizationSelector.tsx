import React from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';

export const OrganizationSelector: React.FC = () => {
    const { organizations, selectOrganization, isLoading } = useProjectManager();

    if (isLoading) {
        return (
            <div className="loading-indicator">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="organization-list">
            <h3>Select an Organization</h3>
            <div className="organizations">
                {organizations.map(org => (
                    <div
                        key={org.id}
                        className="organization-item"
                        onClick={() => selectOrganization(org.username)}
                    >
                        <span className="org-name">{org.full_name}</span>
                        <span className="org-username">{org.username}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}; 