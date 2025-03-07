import { useState, useEffect } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { Header } from './Header';
import { CreateTaskModal } from './CreateTaskModal';
import type { Milestone, Task } from '../../../theia-tpm/translation-project-manager/src/browser/project-manager/models';

interface MilestoneDetailsProps {
  milestoneId: string;
  onBack: () => void;
  projectId: string;
}

export function MilestoneDetails({ milestoneId, onBack, projectId }: MilestoneDetailsProps) {
  const { projectManager } = useProjectManager();
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  useEffect(() => {
    loadMilestoneAndTasks();
  }, [milestoneId]);

  const loadMilestoneAndTasks = async () => {
    if (!projectManager) return;

    try {
      setIsLoading(true);
      setError(null);
      const [milestoneData, tasksData] = await Promise.all([
        projectManager.getMilestone(milestoneId, projectId),
        projectManager.getTasksByMilestone(milestoneId, projectId)
      ]);
      setMilestone(milestoneData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Error loading milestone details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load milestone details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = () => {
    loadMilestoneAndTasks();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header title="Milestone Details Loading..." onBack={onBack} />
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-600">Loading milestone details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header title="Milestone Details" onBack={onBack} />
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="space-y-6">
        <Header title="Milestone Details" onBack={onBack} />
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-600">Milestone not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title={milestone.name}
        onBack={onBack}
      />

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Resources</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">
                {milestone.resourceScope.length > 0 
                  ? milestone.resourceScope.join(', ')
                  : 'No resources assigned'}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Task
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <div className="p-4">
                  <p className="text-gray-600">No tasks created yet</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{task.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Resource: {task.resourceId}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'open' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-sm text-gray-600">{task.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {milestone && (
          <CreateTaskModal
            isOpen={isCreateTaskModalOpen}
            onClose={() => setIsCreateTaskModalOpen(false)}
            milestone={milestone}
            onTaskCreated={handleTaskCreated}
          />
        )}
      </div>
    </div>
  );
} 