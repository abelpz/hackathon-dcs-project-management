import React, { createContext, useContext, useState, useCallback } from 'react';
import { MessageService } from '@theia/core';
import { ProjectManager } from '../project-manager/ProjectManager';
import { ProjectManagerService } from '../project-manager-service';

interface Organization {
    id: number;
    username: string;
    full_name: string;
}

interface ProjectManagerContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    organizations: Organization[];
    projectManager: ProjectManager | undefined;
    error: string | null;
    login: (username: string, password: string, apiUrl: string) => Promise<void>;
    logout: () => void;
    selectOrganization: (username: string) => Promise<void>;
}

const ProjectManagerContext = createContext<ProjectManagerContextType | undefined>(undefined);

export const useProjectManager = () => {
    const context = useContext(ProjectManagerContext);
    if (!context) {
        throw new Error('useProjectManager must be used within a ProjectManagerProvider');
    }
    return context;
};

interface ProjectManagerProviderProps {
    children: React.ReactNode;
    messageService: MessageService;
    projectManagerService: ProjectManagerService;
}

export const ProjectManagerProvider: React.FC<ProjectManagerProviderProps> = ({ 
    children, 
    messageService,
    projectManagerService 
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [projectManager, setProjectManager] = useState<ProjectManager | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (username: string, password: string, apiUrl: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiUrl}/users/${username}/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                },
                body: JSON.stringify({
                    name: 'theia-project-manager-' + Date.now()
                })
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const { sha1 } = await response.json();
            localStorage.setItem('dcs.token', sha1);
            localStorage.setItem('dcs.apiUrl', apiUrl);

            // Load organizations
            const orgsResponse = await fetch(`${apiUrl}/user/orgs`, {
                headers: {
                    'Authorization': `token ${sha1}`,
                    'Accept': 'application/json'
                }
            });

            if (!orgsResponse.ok) {
                throw new Error('Failed to fetch organizations');
            }

            const orgs = await orgsResponse.json();
            setOrganizations(orgs);
            setIsAuthenticated(true);
            messageService.info('Successfully logged in');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            setError(message);
            messageService.error('Login failed: ' + message);
        } finally {
            setIsLoading(false);
        }
    }, [messageService]);

    const logout = useCallback(() => {
        localStorage.removeItem('dcs.token');
        localStorage.removeItem('dcs.apiUrl');
        localStorage.removeItem('dcs.organizationId');
        setIsAuthenticated(false);
        setProjectManager(undefined);
        projectManagerService.clearProjectManager();
        setOrganizations([]);
        messageService.info('Logged out successfully');
    }, [messageService, projectManagerService]);

    const selectOrganization = useCallback(async (username: string) => {
        const token = localStorage.getItem('dcs.token');
        const apiUrl = localStorage.getItem('dcs.apiUrl');

        if (!token || !apiUrl) {
            setError('No valid session found');
            return;
        }

        try {
            localStorage.setItem('dcs.organizationId', username);
            await projectManagerService.initialize(token, apiUrl, username);
            setProjectManager(projectManagerService.getProjectManager());
            messageService.info(`Connected to organization: ${username}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            setError(message);
            messageService.error('Failed to initialize Project Manager: ' + message);
        }
    }, [messageService, projectManagerService]);

    // Check for existing session on mount
    React.useEffect(() => {
        const checkExistingSession = async () => {
            const token = localStorage.getItem('dcs.token');
            const apiUrl = localStorage.getItem('dcs.apiUrl');
            const organizationId = localStorage.getItem('dcs.organizationId');

            if (token && apiUrl) {
                try {
                    const response = await fetch(`${apiUrl}/user`, {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        setIsAuthenticated(true);
                        if (organizationId) {
                            await selectOrganization(organizationId);
                        }
                    } else {
                        logout();
                    }
                } catch (error) {
                    logout();
                }
            }
        };

        checkExistingSession();
    }, [logout, selectOrganization]);

    const value = {
        isAuthenticated,
        isLoading,
        organizations,
        projectManager,
        error,
        login,
        logout,
        selectOrganization
    };

    return (
        <ProjectManagerContext.Provider value={value}>
            {children}
        </ProjectManagerContext.Provider>
    );
};