import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProjectManager } from '../../theia-tpm/translation-project-manager/src/browser/project-manager/ProjectManager';
import { DCSStorageService } from '../../theia-tpm/translation-project-manager/src/browser/project-manager/storage/DCSStorageService';

interface ProjectManagerContextType {
  projectManager: ProjectManager | null;
  isAuthenticated: boolean;
  token: string | null;
  organizationId: string | null;
  login: (token: string, organizationId: string) => Promise<void>;
  logout: () => void;
}

const ProjectManagerContext = createContext<ProjectManagerContextType | null>(null);

export function ProjectManagerProvider({ children }: { children: ReactNode }) {
  const [projectManager, setProjectManager] = useState<ProjectManager | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const login = async (newToken: string, newOrganizationId: string) => {
    const storageService = new DCSStorageService();
    storageService.setConfig({
      token: newToken,
      apiUrl: 'https://qa.door43.org/api/v1',
      organizationId: newOrganizationId
    });

    const newProjectManager = new ProjectManager(storageService, {
      organizationId: newOrganizationId
    });

    await newProjectManager.initialize();
    
    setProjectManager(newProjectManager);
    setToken(newToken);
    setOrganizationId(newOrganizationId);
  };

  const logout = () => {
    setProjectManager(null);
    setToken(null);
    setOrganizationId(null);
  };

  return (
    <ProjectManagerContext.Provider
      value={{
        projectManager,
        isAuthenticated: !!token,
        token,
        organizationId,
        login,
        logout
      }}
    >
      {children}
    </ProjectManagerContext.Provider>
  );
}

export function useProjectManager() {
  const context = useContext(ProjectManagerContext);
  if (!context) {
    throw new Error('useProjectManager must be used within a ProjectManagerProvider');
  }
  return context;
} 