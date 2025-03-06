import { useProjectManager } from '../contexts/ProjectManagerContext';

export function ProjectManagerTest() {
  const { projectManager } = useProjectManager();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Project Manager Test</h1>
        <p className="text-gray-600">
          Test environment for the DCS Project Manager
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">ProjectManager Status</h2>
          <pre className="text-sm bg-gray-50 p-4 rounded-md overflow-auto">
            {JSON.stringify(
              {
                initialized: !!projectManager,
                organizationId: projectManager?.organizationId,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
} 