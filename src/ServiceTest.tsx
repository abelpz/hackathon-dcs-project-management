import React, { useState } from 'react';
import { useProjectService } from './core/dcs/hooks/useProjectService';
import type { ProjectDefinition } from './core/dcs/types/project.types';

type OperationResult = ProjectDefinition | ProjectDefinition[] | { active: ProjectDefinition[], finished: ProjectDefinition[] } | string | null;

export default function ServiceTest({ token }: { token: string }) {
  const projectService = useProjectService(token, "es-419_lab");
  const [result, setResult] = useState<OperationResult>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to execute service operations safely
  const executeOperation = async (operation: () => Promise<OperationResult>, name: string) => {
    if (!projectService) {
      setError('Service not ready');
      return;
    }
    
    try {
      setError(null);
      const result = await operation();
      setResult(result);
      console.log(`${name} succeeded:`, result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error(`${name} failed:`, err);
    }
  };

  // Project Operations
  const handleCreateProject = () => {
    if (!projectService) return;
    executeOperation(async () => {
      return projectService.createProject({
        id: "project-test",
        name: "Test Project",
        description: "A test project created via ServiceTest",
        assignedTeam: {
          id: "team1",
          name: "Test Team"
        },
        linkedRepositories: [],
        milestones: []
      });
    }, "Create Project");
  };

  const handleListProjects = () => {
    if (!projectService) return;
    executeOperation(async () => {
      return projectService.listProjects();
    }, "List Projects");
  };

  const handleGetProject = () => {
    if (!projectService) return;
    executeOperation(async () => {
      return projectService.getProject("test3");
    }, "Get Project");
  };

  const handleUpdateProject = () => {
    if (!projectService) return;
    executeOperation(async () => {
      const project = await projectService.getProject("test3");
      const updatedProject: ProjectDefinition = {
        ...project,
        description: `Updated at ${new Date().toISOString()}`
      };
      await projectService.updateProject(updatedProject);
      return updatedProject;
    }, "Update Project");
  };

  const handleCompleteProject = () => {
    if (!projectService) return;
    executeOperation(async () => {
      await projectService.completeProject("test3");
      return "Project marked as completed";
    }, "Complete Project");
  };

  // Milestone Operations
  const handleAddMilestone = () => {
    if (!projectService) return;
    executeOperation(async () => {
      await projectService.addMilestone("test3", {
        name: "Test Milestone",
        description: "A test milestone",
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
      });
      return "Milestone added successfully";
    }, "Add Milestone");
  };

  const handleUpdateMilestone = () => {
    if (!projectService) return;
    executeOperation(async () => {
      const project = await projectService.getProject("test3");
      if (!project.milestones.length) throw new Error("No milestones to update");
      
      await projectService.updateMilestone("test3", project.milestones[0].id, {
        description: `Updated milestone at ${new Date().toISOString()}`
      });
      return "Milestone updated successfully";
    }, "Update Milestone");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">DCS Service Test Panel</h2>
      
      {/* Service Status */}
      <div className="mb-4">
        <div className={`p-2 rounded ${projectService ? 'bg-green-100' : 'bg-red-100'}`}>
          Service Status: {projectService ? 'Ready' : 'Not Ready'}
        </div>
      </div>

      {/* Project Operations */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Project Operations</h3>
        <div className="space-x-2">
          <button
            onClick={handleCreateProject}
            disabled={!projectService}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Create Project
          </button>
          <button
            onClick={handleListProjects}
            disabled={!projectService}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            List Projects
          </button>
          <button
            onClick={handleGetProject}
            disabled={!projectService}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Get Project
          </button>
          <button
            onClick={handleUpdateProject}
            disabled={!projectService}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Update Project
          </button>
          <button
            onClick={handleCompleteProject}
            disabled={!projectService}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Complete Project
          </button>
        </div>
      </div>

      {/* Milestone Operations */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Milestone Operations</h3>
        <div className="space-x-2">
          <button
            onClick={handleAddMilestone}
            disabled={!projectService}
            className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            Add Milestone
          </button>
          <button
            onClick={handleUpdateMilestone}
            disabled={!projectService}
            className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            Update Milestone
          </button>
        </div>
      </div>

      {/* Results Display */}
      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="p-2 bg-gray-100 rounded overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 