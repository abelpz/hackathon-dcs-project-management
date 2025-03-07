import React, { useState, FormEvent } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { Task } from '../project-manager';

interface CreateTaskModalProps {
    onClose: () => void;
    onTaskCreated: () => void;
    currentTaskata?: Task;
    projectId: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onTaskCreated, currentTaskData, projectId }) => {
    const { projectManager } = useProjectManager();
    const [formData, setFormData] = useState<Partial<Task>>(currentTaskData ?? {
        name: '',
        description: '',
        status: 'open',
        projectId: projectId
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!projectManager) return;

        setIsLoading(true);
        setError(null);

        try {
            if (currentTaskData){
          await projectManager.updateTask({
            id: currentTaskData.id,
            type: currentTaskData.type,
            name: formData.name?.trim() || "",
            description: formData.description?.trim() || "",
            projectId: projectId,
            teamId: currentTaskData.teamId,
            resourceScope: formData.resourceScope || [],
            status: formData.status as 'open' | 'closed'
        }, projectId
          )
        } else {
            await projectManager.createTask(
                formData.name?.trim() || "",
                projectId,
                formData.teamId?.trim() || "",
                formData.resourceScope || []
              )
        };
            onTaskCreated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create or update task');
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
                    <h3>Create New Task</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Task Name</label>
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
                            {isLoading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 