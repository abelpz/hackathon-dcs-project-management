import React, { useState, FormEvent } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { Project } from '../project-manager';

interface CreateProjectModalProps {
    onClose: () => void;
    onProjectCreated: () => void;
    currentProjectData?: Project;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onProjectCreated, currentProjectData }) => {
    const { projectManager } = useProjectManager();
    const [formData, setFormData] = useState<Partial<Project>>(currentProjectData ?? {
        name: '',
        description: '',
        status: 'active'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!projectManager) return;

        setIsLoading(true);
        setError(null);

        try {
            if (currentProjectData){
          await projectManager.updateProject({
            name: formData.name?.trim() || "",
            teamId: "",
            sourceResources: formData.sourceResources || [],
            targetResources: formData.targetResources || [],
            description: formData.description?.trim(),
            status: formData.status as 'active' | 'complete' | 'archived',
            id: currentProjectData.id,
            organizationId: currentProjectData.organizationId
        }
          )
        } else {
            await projectManager.createProject(
                formData.name?.trim() || "",
                "",
                formData.sourceResources || [],
                formData.targetResources || [],
                formData.description?.trim(),
                formData.status as 'active' | 'complete' | 'archived'
              )
        };
            onProjectCreated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        (name === 'targetResources' || name === 'sourceResources')
        ? setFormData((prev) => ({...prev, [name]: value.split(',').map((e) => e.trim())}))
        : setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{currentProjectData ? "Edit Project" : "Create New Project"}</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Project Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="theia-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="theia-input"
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="theia-input"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Target Resources</label>
                        <input
                            type="text"
                            id="targetResources"
                            name="targetResources"
                            value={formData.targetResources}
                            onChange={handleChange}
                            required
                            className="theia-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Source Resources</label>
                        <input
                            type="text"
                            id="sourceResources"
                            name="sourceResources"
                            value={formData.sourceResources}
                            onChange={handleChange}
                            required
                            className="theia-input"
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="theia-button secondary" 
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="theia-button main"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 