import { useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  teamId: string;
  availableResources: string[];
  onMilestoneCreated: () => void;
}

export function CreateMilestoneModal({
  isOpen,
  onClose,
  projectId,
  teamId,
  availableResources,
  onMilestoneCreated
}: CreateMilestoneModalProps) {
  const { projectManager } = useProjectManager();
  const [name, setName] = useState('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectManager) return;

    try {
      setIsLoading(true);
      setError(null);

      await projectManager.createMilestone(
        name,
        projectId,
        teamId,
        selectedResources
      );

      onMilestoneCreated();
      onClose();
    } catch (err) {
      console.error('Error creating milestone:', err);
      setError(err instanceof Error ? err.message : 'Failed to create milestone');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Create New Milestone</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Milestone Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resources
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
              {availableResources.map((resource) => (
                <label key={resource} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedResources.includes(resource)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedResources([...selectedResources, resource]);
                      } else {
                        setSelectedResources(selectedResources.filter(r => r !== resource));
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">{resource}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name || selectedResources.length === 0}
              className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (isLoading || !name || selectedResources.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating...' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 