import React, { useState, FormEvent } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { Milestone } from '../project-manager';

interface CreateMilestoneModalProps {
    onClose: () => void;
    onMilestoneCreated: () => void;
    currentMilestoneData?: Milestone;
    projectId: string;
}

export const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({ onClose, onMilestoneCreated, currentMilestoneData, projectId }) => {
    const { projectManager } = useProjectManager();
    const [formData, setFormData] = useState<Partial<Milestone>>(currentMilestoneData ?? {
        name: '',
        projectId: '',
        status: 'open'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!projectManager) return;

        setIsLoading(true);
        setError(null);

        try {
            if (currentMilestoneData){
          await projectManager.updateMilestone({
            
            id: currentMilestoneData.id,
            type: currentMilestoneData.type,
            name: formData.name?.trim() || "",
            description: formData.description?.trim() || "",
            projectId: formData.projectId?.trim() || "",
            teamId: "",
            resourceScope: formData.resourceScope || [],
            status: formData.status as 'open' | 'closed'
        }, projectId
          )
        } else {
            await projectManager.createMilestone(
                formData.name?.trim() || "",
                projectId,
                formData.teamId?.trim() || "",
                formData.resourceScope || []
              )
        };
            onMilestoneCreated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create or update milestone');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        (name === 'resourceScope')
        ? setFormData((prev) => ({...prev, [name]: value.split(',').map((e) => e.trim())}))
        : setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Create New Milestone</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Milestone Name</label>
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
                            <option value="open">Active</option>
                            <option value="closed">Inactive</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Resource Scope</label>
                        <input
                            type="text"
                            id="resourceScope"
                            name="resourceScope"
                            value={formData.resourceScope}
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
                            {isLoading ? 'Creating...' : 'Create Milestone'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 