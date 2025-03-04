/*
 * Módulo de Gestión de Proyectos
 * 
 * Este módulo implementa la capa de adaptador DCS para la gestión de proyectos.
 * La arquitectura completa y los flujos de datos están documentados en ARCHITECTURE.md.
 * 
 * El módulo maneja:
 * - Creación y gestión de repositorios en DCS
 * - Interacción con el repositorio relacional de proyectos
 * - Operaciones CRUD sobre proyectos y sus componentes
 * 
 * This uses the DCS API to interact with the projects repository.
 * The projects repository is a repository that contains the project definitions.
 * The project definitions are stored in the project-management repository.
 * The project-management repository is a repository that contains the project definitions for all projects.
 * 
 */

import { PROJECTS_REPO_ORG, PROJECTS_REPO_NAME } from "./constants";

// DCS API Types
interface User {
  id: number;
  login: string;
  full_name: string;
  email: string;
  avatar_url: string;
  username: string;
}

interface Repository {
  id: number;
  owner: User;
  name: string;
  full_name: string;
  description: string;
  empty: boolean;
  private: boolean;
  fork: boolean;
  template: boolean;
  parent: Repository | null;
  mirror: boolean;
  size: number;
  html_url: string;
  ssh_url: string;
  clone_url: string;
  website: string;
  stars_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  default_branch: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  permissions: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

interface FileContentResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

interface ErrorResponse {
  message: string;
  url?: string;
}

// Project Types
type ProjectMilestone = {
  name: string;
  repos: string[];
}

type ProjectData = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  milestones: ProjectMilestone[];
  repos: string[];
}

export type ProjectSummary = {
  name: string;
  status: string;
  folder: string;
}

export type ProjectList = {
  projects: ProjectSummary[];
  lastUpdated: string;
}

// Utility Functions
const getFormattedJsonString = (object: object) => {
  return JSON.stringify(object, null, 2);
}

export async function deleteFileInRepo(repoName: string, fileSha: string, orgName: string, token: string, path: string): Promise<boolean> {
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/contents/${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sha: fileSha
    })
  });
  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.status} ${response.statusText}`);
  }
  return true;
}

export async function createFileInRepo(repoName: string, orgName: string, token: string, path: string, content: string): Promise<FileContentResponse> {
  const encodedContent = btoa(content);
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/contents/${path}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      content: encodedContent,
      message: `Create ${path}`
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error((errorData as ErrorResponse).message || `Failed to create file: ${response.status}`);
  }

  const data = await response.json();
  return data as FileContentResponse;
}

export async function updateFileInRepo(repoName: string, orgName: string, token: string, path: string, content: string, sha: string): Promise<FileContentResponse> {
  const encodedContent = btoa(content);
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      content: encodedContent,
      message: `Update ${path}`,
      sha: sha
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error((errorData as ErrorResponse).message || `Failed to update file: ${response.status}`);
  }

  const data = await response.json();
  return data as FileContentResponse;
}

export async function createRepoInOrg(repoName: string, orgName: string, token: string): Promise<Repository> {
  const response = await fetch(`https://qa.door43.org/api/v1/orgs/${orgName}/repos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'authorization': `Bearer ${token}`
    },
    body: getFormattedJsonString({
      name: repoName
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error((errorData as ErrorResponse).message || `Failed to create repository: ${response.status}`);
  }
  
  const data = await response.json();
  console.log({data});
  return data as Repository;
}

// Project Management Functions
export async function checkProjectsRepoExists(): Promise<boolean> {
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}`);
  if (response.status === 404) {
    return false;
  }
  if (response.status === 200) {
    return true;
  }
  throw new Error(`Failed to check projects repo exists: ${response.status} ${response.statusText}`);
}

export async function createProjectsFolder(token: string): Promise<FileContentResponse> {
  try {
    // Create a README.md file in the folder to implicitly create the directory
    const content = 'This folder contains project definitions.';
    const response = await createFileInRepo(PROJECTS_REPO_NAME, PROJECTS_REPO_ORG, token, 'projects/README.md', content);
    console.log(`Created folder projects in ${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}`);
    return response;
  } catch (error) {
    console.error(`Error creating folder in repository:`, error);
    throw error;
  }
}

export async function createProjectsRepo(token: string): Promise<Repository> {
  try {
    const repoResponse = await createRepoInOrg(PROJECTS_REPO_NAME, PROJECTS_REPO_ORG, token);
    
    if (repoResponse && repoResponse.id) {
      // Successfully created repository, now create the projects folder
      await createProjectsFolder(token);
      console.log('Repository and projects folder created successfully');
      return repoResponse;
    } else {
      throw new Error('Failed to create repository: Invalid response');
    }
  } catch (error) {
    console.error('Error in createProjectsRepo:', error);
    throw error;
  }
}

export async function checkProjectExists(projectName: string): Promise<boolean> {
  const projectFolders = ['active', 'completed', 'archived'];
  for (const folder of projectFolders) {
    try {
      const response = await fetch(`https://qa.door43.org/api/v1/repos/${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}/contents/projects/${folder}/${projectName}.json`);
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      console.error(`Error checking project exists: ${error}`);
    }
  }
  return false;
}

export async function getProjects(): Promise<ProjectList> {
  const projectFolders = ['active', 'completed', 'archived'];
  const projects: ProjectSummary[] = [];

  for (const folder of projectFolders) {
    const response = await fetch(`https://qa.door43.org/api/v1/repos/${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}/contents/projects/${folder}`);
    if (response.ok) {
      const files = await response.json() as FileContentResponse[];
      for (const file of files) {
        if (file.name.endsWith('.json') && file.name !== 'project-list.json') {
          try {
            const projectResponse = await fetch(file.download_url);
            if (projectResponse.ok) {
              const projectData = await projectResponse.json() as ProjectData;
              projects.push({
                name: projectData.name,
                status: projectData.status,
                folder: folder
              });
            }
          } catch (error) {
            console.error(`Error reading project file ${file.name}:`, error);
          }
        }
      }
    }
  }

  const projectList: ProjectList = {
    projects,
    lastUpdated: new Date().toISOString()
  };

  return projectList;
}

async function updateProjectList(token: string): Promise<FileContentResponse> {
  const projectList = await getProjects();
  const projectListContent = getFormattedJsonString(projectList);

  try {
    // Try to get existing project list file
    const response = await fetch(`https://qa.door43.org/api/v1/repos/${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}/contents/projects/project-list.json`);
    if (response.ok) {
      const existingFile = await response.json() as FileContentResponse;
      return await updateFileInRepo(PROJECTS_REPO_NAME, PROJECTS_REPO_ORG, token, 'projects/project-list.json', projectListContent, existingFile.sha);
    } else {
      return await createFileInRepo(PROJECTS_REPO_NAME, PROJECTS_REPO_ORG, token, 'projects/project-list.json', projectListContent);
    }
  } catch (error) {
    console.error('Error updating project list:', error);
    throw error;
  }
}

export async function createProject(token: string, projectData: ProjectData): Promise<FileContentResponse> {
  const projectBody = getFormattedJsonString(projectData);

  const projectsFolderExists = await checkProjectsRepoExists();
  if (!projectsFolderExists) {
    await createProjectsRepo(token);
  }
  const projectExists = await checkProjectExists(projectData.name);
  if (projectExists) {
    throw new Error(`Project ${projectData.name} already exists`);
  }

  const validName = projectData.name.replace(/[^a-zA-Z0-9]/g, '-');
  const result = await createFileInRepo(PROJECTS_REPO_NAME, PROJECTS_REPO_ORG, token, `projects/active/${validName}.json`, projectBody);
  await updateProjectList(token);
  return result;
}

export async function getProject(projectName: string): Promise<{ data: FileContentResponse; path: string }> {
  const projectFolders = ['active', 'completed', 'archived'];
  for (const folder of projectFolders) {
    const response = await fetch(`https://qa.door43.org/api/v1/repos/${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}/contents/projects/${folder}/${projectName}.json`);
    if (response.status === 200) {
      const data = await response.json();
      return {
        data: data as FileContentResponse,
        path: `projects/${folder}/${projectName}.json`,
      };
    }
  }
  throw new Error(`Project ${projectName} not found`);
}

export async function updateProject(token: string, projectName: string, projectData: ProjectData): Promise<FileContentResponse> {
  const projectBody = getFormattedJsonString(projectData);
  const {data: project, path} = await getProject(projectName);
  const result = await updateFileInRepo(PROJECTS_REPO_NAME, PROJECTS_REPO_ORG, token, path, projectBody, project.sha);
  await updateProjectList(token);
  return result;
}

export async function archiveProject(token: string, projectName: string): Promise<FileContentResponse> {
  const {data: project, path} = await getProject(projectName);
  const projectBody = atob(project.content);

  // First, delete the project from the active folder
  await deleteFileInRepo(PROJECTS_REPO_NAME, project.sha, PROJECTS_REPO_ORG, token, path);

  // Then, create the project in the archived folder
  const result = await createFileInRepo(PROJECTS_REPO_NAME, PROJECTS_REPO_ORG, token, `projects/archived/${projectName}.json`, projectBody);
  await updateProjectList(token);
  return result;
}

export async function deleteAllProjects(token: string): Promise<void> {
  const projectFolders = ['active', 'completed', 'archived'];
  
  for (const folder of projectFolders) {
    const response = await fetch(`https://qa.door43.org/api/v1/repos/${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}/contents/projects/${folder}`);
    if (response.ok) {
      const files = await response.json() as FileContentResponse[];
      for (const file of files) {
        if (file.name.endsWith('.json') && file.name !== 'project-list.json') {
          try {
            await deleteFileInRepo(PROJECTS_REPO_NAME, file.sha, PROJECTS_REPO_ORG, token, `projects/${folder}/${file.name}`);
          } catch (error) {
            console.error(`Error deleting project file ${file.name}:`, error);
          }
        }
      }
    }
  }

  // Also delete the project-list.json if it exists
  try {
    const listResponse = await fetch(`https://qa.door43.org/api/v1/repos/${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}/contents/projects/project-list.json`);
    if (listResponse.ok) {
      const listFile = await listResponse.json() as FileContentResponse;
      await deleteFileInRepo(PROJECTS_REPO_NAME, listFile.sha, PROJECTS_REPO_ORG, token, 'projects/project-list.json');
    }
  } catch (error) {
    console.error('Error deleting project list:', error);
  }
}
