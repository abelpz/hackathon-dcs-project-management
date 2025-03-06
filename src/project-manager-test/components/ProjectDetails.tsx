import { useState, useEffect } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { Header } from './Header';
import { CreateMilestoneModal } from './CreateMilestoneModal';
import { MilestoneDetails } from './MilestoneDetails';
import type { Project, Milestone } from '../../core/project-manager/models';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetails({ projectId, onBack }: ProjectDetailsProps) {
  const { projectManager } = useProjectManager();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateMilestoneModalOpen, setIsCreateMilestoneModalOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isAddingResources, setIsAddingResources] = useState(false);
  const [newSourceResource, setNewSourceResource] = useState('');
  const [newTargetResource, setNewTargetResource] = useState('');
  const [addResourceError, setAddResourceError] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectManager) return;

    try {
      setIsLoading(true);
      setError(null);
      const [projectData, milestonesData] = await Promise.all([
        projectManager.getProject(projectId),
        projectManager.getMilestonesByProject(projectId)
      ]);
      setProject(projectData);
      setMilestones(milestonesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMilestoneCreated = () => {
    loadProject();
  };

  const handleAddResources = async () => {
    if (!projectManager || !project) return;
    setAddResourceError(null);

    try {
      const sourceResources = newSourceResource ? [newSourceResource] : [];
      const targetResources = newTargetResource ? [newTargetResource] : [];

      if (sourceResources.length === 0 && targetResources.length === 0) {
        setAddResourceError('Please enter at least one resource');
        return;
      }

      await projectManager.addResourcesToProject(
        projectId,
        sourceResources,
        targetResources
      );

      // Reset form and reload project
      setNewSourceResource('');
      setNewTargetResource('');
      setIsAddingResources(false);
      loadProject();
    } catch (err) {
      setAddResourceError(err instanceof Error ? err.message : 'Failed to add resources');
    }
  };

  if (selectedMilestoneId) {
    return (
      <MilestoneDetails
        milestoneId={selectedMilestoneId}
        onBack={() => setSelectedMilestoneId(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header title="Project Details" onBack={onBack} />
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-600">Loading project details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header title="Project Details" onBack={onBack} />
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Header title="Project Details" onBack={onBack} />
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-600">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title={project.name}
        onBack={onBack}
        actions={
          <span className={`px-2 py-1 rounded-full text-sm ${
            project.status === 'active' ? 'bg-green-100 text-green-700' :
            project.status === 'complete' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {project.status}
          </span>
        }
      />

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 mb-6">{project.description}</p>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Team</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">Team ID: {project.teamId || 'No team assigned'}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Resources</h2>
              <button
                onClick={() => setIsAddingResources(!isAddingResources)}
                className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isAddingResources ? 'Cancel' : 'Add Resources'}
              </button>
            </div>
            
            {isAddingResources && (
              <div className="mb-4 space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div>
                  <label htmlFor="sourceResource" className="block text-sm font-medium text-gray-700">
                    Source Resource
                  </label>
                  <input
                    type="text"
                    id="sourceResource"
                    value={newSourceResource}
                    onChange={(e) => setNewSourceResource(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    placeholder="Enter source resource name"
                  />
                </div>
                <div>
                  <label htmlFor="targetResource" className="block text-sm font-medium text-gray-700">
                    Target Resource
                  </label>
                  <input
                    type="text"
                    id="targetResource"
                    value={newTargetResource}
                    onChange={(e) => setNewTargetResource(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    placeholder="Enter target resource name"
                  />
                </div>
                {addResourceError && (
                  <div className="text-sm text-red-600">
                    {addResourceError}
                  </div>
                )}
                <button
                  onClick={handleAddResources}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Resources
                </button>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Source Resources:</h3>
                  <p className="text-gray-600">
                    {project.sourceResources.length > 0 
                      ? project.sourceResources.join(', ')
                      : 'No source resources'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Target Resources:</h3>
                  <p className="text-gray-600">
                    {project.targetResources.length > 0
                      ? project.targetResources.join(', ')
                      : 'No target resources'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Milestones</h2>
            <button
              onClick={() => setIsCreateMilestoneModalOpen(true)}
              disabled={project.targetResources.length === 0}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                project.targetResources.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              title={project.targetResources.length === 0 ? 'Add target resources to create milestones' : undefined}
            >
              Create Milestone
            </button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-200">
            {milestones.length === 0 ? (
              <div className="p-4">
                <p className="text-gray-600">
                  {project.targetResources.length === 0
                    ? 'Add target resources to create milestones'
                    : 'No milestones created yet'}
                </p>
              </div>
            ) : (
              milestones.map((milestone: Milestone) => (
                <div
                  key={milestone.id}
                  className="p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => setSelectedMilestoneId(milestone.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{milestone.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Resources: {milestone.resourceScope.join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {milestone.resourceScope.some((r: string) => project.sourceResources.includes(r)) && (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          Source
                        </span>
                      )}
                      {milestone.resourceScope.some((r: string) => project.targetResources.includes(r)) && (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Target
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <CreateMilestoneModal
          isOpen={isCreateMilestoneModalOpen}
          onClose={() => setIsCreateMilestoneModalOpen(false)}
          projectId={projectId}
          teamId={project.teamId}
          availableResources={[...project.sourceResources, ...project.targetResources]}
          onMilestoneCreated={handleMilestoneCreated}
        />
      </div>
    </div>
  );
} 