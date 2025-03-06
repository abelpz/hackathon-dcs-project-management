import { useProjectManager } from '../contexts/ProjectManagerContext';
import { DCSLogin } from './DCSLogin';

export function Sidebar() {
  const { isAuthenticated, organizationId, logout } = useProjectManager();

  if (!isAuthenticated) {
    return <DCSLogin />;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Organization</h2>
        <div className="text-gray-600">{organizationId}</div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 