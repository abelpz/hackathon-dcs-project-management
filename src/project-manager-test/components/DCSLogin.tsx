import { useState } from 'react';
import { getToken } from '../../core/authentication';
import { useProjectManager } from '../contexts/ProjectManagerContext';

interface Organization {
  id: number;
  username: string;
  full_name: string;
}

export function DCSLogin() {
  const { login } = useProjectManager();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showOrgSelect, setShowOrgSelect] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken(username, password);
      
      // Fetch organizations
      const response = await fetch('https://qa.door43.org/api/v1/user/orgs', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const orgs = await response.json();
      setOrganizations(orgs);
      setShowOrgSelect(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationSelect = async (org: Organization) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get a fresh token
      const token = await getToken(username, password);
      
      // Initialize ProjectManager with selected organization
      await login(token, org.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize ProjectManager');
    } finally {
      setIsLoading(false);
    }
  };

  if (showOrgSelect) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Select Organization</h2>
        <div className="space-y-2">
          {organizations.map(org => (
            <button
              key={org.id}
              onClick={() => handleOrganizationSelect(org)}
              className="w-full p-3 text-left hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
            >
              <div className="font-medium">{org.full_name}</div>
              <div className="text-sm text-gray-500">{org.username}</div>
            </button>
          ))}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">DCS Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-400 border-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3.5"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-400 border-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-3.5"
            required
          />
        </div>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
} 