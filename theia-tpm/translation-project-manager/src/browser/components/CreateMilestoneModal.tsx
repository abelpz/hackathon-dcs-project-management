import React, { useState, FormEvent } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';

interface CreateMilestoneModalProps {
    onClose: () => void;
    onMilestoneCreated: () => void;
}

export const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({ onClose, onMilestoneCreated }) => {
    const { projectManager } = useProjectManager();
    const [formData, setFormData] = useState({
        name: '',
        projectId: '',
        teamId: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!projectManager) return;

        setIsLoading(true);
        setError(null);

        try {
          await projectManager.createMilestone( 
            formData.name.trim(),
            formData.projectId.trim(),
            formData.teamId.trim(),
            []
          );
            onMilestoneCreated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create milestone');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                            value={formData.projectId}
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
                            value={formData.teamId}
                            onChange={handleChange}
                            className="theia-input"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
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