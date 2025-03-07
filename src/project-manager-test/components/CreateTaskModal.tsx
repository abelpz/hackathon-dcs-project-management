import { useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import type { Milestone } from '../../../theia-tpm/translation-project-manager/src/browser/project-manager/models';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone;
  onTaskCreated: () => void;
}

export function CreateTaskModal({ isOpen, onClose, milestone, onTaskCreated }: CreateTaskModalProps) {
  const { projectManager } = useProjectManager();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectManager) return;

    try {
      setIsLoading(true);
      setError(null);

      if (!name.trim()) {
        setError('Task name is required');
        return;
      }

      if (!selectedResource) {
        setError('Please select a resource');
        return;
      }

      await projectManager.createTask(
        name.trim(),
        milestone.id,
        selectedResource,
        [],
        description.trim()
      );

      onTaskCreated();
      onClose();
      setName('');
      setDescription('');
      setSelectedResource('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Task Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base border-1 px-3.5 py-2"
                placeholder="Enter task name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base border-1 px-3.5 py-2"
                placeholder="Enter task description"
              />
            </div>

            <div>
              <label htmlFor="resource" className="block text-sm font-medium text-gray-700">
                Resource
              </label>
              <select
                id="resource"
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base border-1 px-3.5 py-2"
              >
                <option value="">Select a resource</option>
                {milestone.resourceScope.map((resource) => (
                  <option key={resource} value={resource}>
                    {resource}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 