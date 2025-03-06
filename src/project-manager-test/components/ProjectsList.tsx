import { useState, useEffect } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Header } from './Header';
import type { Project } from '../../../theia-tpm/translation-project-manager/src/browser/project-manager/models';

export function ProjectsList() {
  const { projectManager } = useProjectManager();
  const { navigateTo } = useNavigation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load projects when component mounts
  useEffect(() => {
    loadProjects();
  }, [projectManager]);

  const loadProjects = async () => {
    if (!projectManager) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const projectsList = await projectManager.getAllProjects();
      setProjects(projectsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllProjects = async () => {
    if (!projectManager) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      
      // Delete each project
      for (const project of projects) {

        await projectManager.deleteProject(project.id);
      }
      
      // Reload the projects list
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete projects');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const headerActions = (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => navigateTo({ id: 'create', name: 'createProject' })}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        disabled={isDeleting}
      >
        Create Project
      </button>
      <button
        onClick={handleDeleteAllProjects}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        disabled={isDeleting || projects.length === 0}
      >
        {isDeleting ? 'Deleting...' : 'Delete All'}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <Header 
        title="Projects" 
        actions={headerActions}
      />

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600">No projects found</p>
          <p className="text-gray-500 text-sm mt-2">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigateTo({
                id: project.id,
                name: 'projectDetails',
                params: { projectId: project.id }
              })}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors cursor-pointer"
            >
              <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{project.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  project.status === 'active' ? 'bg-green-100 text-green-700' :
                  project.status === 'complete' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo({
                      id: project.id,
                      name: 'projectDetails',
                      params: { projectId: project.id }
                    });
                  }}
                  className="text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 