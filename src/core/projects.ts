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
import { createMilestone, updateMilestone, closeMilestone } from "./milestone";
import { Issue, getAllMilestoneIssues, createIssue, CreateIssueOptions, updateIssue } from './issues';

// Domain Types
export interface Organization {
  id: string;
  type: 'organization';
  name: string;
}

export interface Project {
  id: string;
  type: 'project';
  name: string;
  organizationId: string;
  resourceScope: string[]; // IDs of organization resources that can be affected by this project
}

export interface Milestone {
  id: string;
  type: 'milestone';
  name: string;
  projectId: string;
  resourceScope: string[]; // Subset of project resource IDs that can be affected by this milestone
}

export interface Task {
  id: string;
  type: 'task';
  name: string;
  milestoneId: string;
  resourceId: string; // ID of the single resource from milestone scope that this task affects
  status: 'open' | 'closed';
  description?: string;
}

// Translation Resource Types
export interface Resource {
  id: string;
  type: 'resource';
  name: string;
  path: string;
  projectId: string;
}

export interface MilestoneResource {
  id: string;
  type: 'milestone-resource';
  name: string;
  path: string;
  milestoneId: string;
}

// Resource Validation Functions
function validateProjectResources(projectResources: string[], organizationResources: string[]): boolean {
  return projectResources.every(resource => organizationResources.includes(resource));
}

function validateMilestoneResources(milestoneResources: string[], projectResources: string[]): boolean {
  return milestoneResources.every(resource => projectResources.includes(resource));
}

function validateTaskResource(taskResource: string, milestoneResources: string[]): boolean {
  return milestoneResources.includes(taskResource);
}

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
type DCSMilestoneMapping = {
  repoName: string;
  milestoneId: string;
};

type ProjectMilestone = {
  id?: string;  // Optional for creation, will be generated
  name: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  status: 'open' | 'closed';
  resources: string[];  // List of resources this milestone is associated with
  dcsMapping?: DCSMilestoneMapping[];
}

type ProcessedProjectMilestone = {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  status: 'open' | 'closed';
  resources: string[];
  dcsMapping: DCSMilestoneMapping[];
}

type ProjectData = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  milestones: ProjectMilestone[];
  resources: string[];  // List of resources associated with this project
}

type ProcessedProjectData = Omit<ProjectData, 'milestones'> & {
  milestones: ProcessedProjectMilestone[];
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

interface ProjectCache {
  data: ProjectList | ProjectDetailsMap;
  timestamp: number;
  version: string;
  type: 'summary' | 'full';
}

interface ProjectDetailsMap {
  projects: {[key: string]: ProcessedProjectData};
  lastUpdated: string;
}

const PROJECT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let projectListCache: ProjectCache | null = null;

async function getCacheVersion(): Promise<string> {
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}/commits?limit=1`);
  if (!response.ok) return Date.now().toString();
  const commits = await response.json();
  return commits[0]?.sha || Date.now().toString();
}

export async function getProjects(
  status: 'active' | 'completed' | 'archived' | 'all' = 'all',
  useCache: boolean = true,
  includeFull: boolean = false
): Promise<ProjectList | ProjectDetailsMap> {
  // Check cache if enabled
  if (useCache && projectListCache) {
    const now = Date.now();
    const cacheAge = now - projectListCache.timestamp;
    
    if (cacheAge < PROJECT_CACHE_TTL && projectListCache.type === (includeFull ? 'full' : 'summary')) {
      // Cache is still valid and matches the requested type
      if (!includeFull) {
        const data = projectListCache.data as ProjectList;
        const filteredProjects = status === 'all' 
          ? data.projects
          : data.projects.filter(p => p.folder === status);
          
        return {
          projects: filteredProjects,
          lastUpdated: data.lastUpdated
        };
      }
      return projectListCache.data as ProjectDetailsMap;
    }
  }

  if (!includeFull) {
    // Fetch summary data from project-list.json
    try {
      const response = await fetch(`https://qa.door43.org/api/v1/repos/${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}/contents/projects/project-list.json`);
      if (response.ok) {
        const file = await response.json() as FileContentResponse;
        const projectList = JSON.parse(atob(file.content)) as ProjectList;
        
        // Filter projects based on status
        const filteredProjects = status === 'all' 
          ? projectList.projects
          : projectList.projects.filter(p => p.folder === status);

        const result = {
          projects: filteredProjects,
          lastUpdated: projectList.lastUpdated
        };

        // Update cache if enabled
        if (useCache) {
          projectListCache = {
            data: result,
            timestamp: Date.now(),
            version: await getCacheVersion(),
            type: 'summary'
          };
        }

        return result;
      }
    } catch (error) {
      console.error('Error fetching project-list.json:', error);
      // Fall through to fetching individual files if project-list.json fails
    }
  }

  // Fetch full project data from individual files
  const projectDetailsMap: ProjectDetailsMap = {
    projects: {},
    lastUpdated: new Date().toISOString()
  };

  let projectFolders: string[];
  if (status === 'all') {
    projectFolders = ['active', 'completed', 'archived'];
  } else {
    projectFolders = [status];
  }

  // Process folders in parallel
  const folderPromises = projectFolders.map(async (folder) => {
    const response = await fetch(`https://qa.door43.org/api/v1/repos/${PROJECTS_REPO_ORG}/${PROJECTS_REPO_NAME}/contents/projects/${folder}`);
    if (!response.ok) return;

    const files = await response.json() as FileContentResponse[];
    const projectFiles = files.filter(file => 
      file.name.endsWith('.json') && file.name !== 'project-list.json'
    );

    // Process files in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < projectFiles.length; i += batchSize) {
      const batch = projectFiles.slice(i, i + batchSize);
      const batchPromises = batch.map(async (file) => {
        try {
          const projectResponse = await fetch(file.download_url);
          if (!projectResponse.ok) return;

          const projectData = await projectResponse.json() as ProcessedProjectData;
          projectDetailsMap.projects[projectData.name] = projectData;
        } catch (error) {
          console.error(`Error reading project file ${file.name}:`, error);
        }
      });

      await Promise.all(batchPromises);

      // Add a small delay between batches to prevent rate limiting
      if (i + batchSize < projectFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  });

  await Promise.all(folderPromises);

  // Update cache if enabled
  if (useCache) {
    projectListCache = {
      data: projectDetailsMap,
      timestamp: Date.now(),
      version: await getCacheVersion(),
      type: 'full'
    };
  }

  return projectDetailsMap;
}

export async function invalidateProjectCache(): Promise<void> {
  projectListCache = null;
}

async function updateProjectList(token: string): Promise<FileContentResponse> {
  await invalidateProjectCache(); // Invalidate cache before updating
  const projectList = await getProjects('all', false); // Force fresh data
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
  // Validate project resources
  const organizationResources = await getOrganizationResources(token);
  if (!validateProjectResources(projectData.resources, organizationResources)) {
    throw new Error('Project resources must be a subset of organization resources');
  }

  // Process the milestones to add IDs and create DCS mappings
  const processedMilestones: ProcessedProjectMilestone[] = [];
  
  // Process milestones in batches
  const batchSize = 3; // Adjust based on API limits
  for (let i = 0; i < projectData.milestones.length; i += batchSize) {
    const milestoneBatch = projectData.milestones.slice(i, i + batchSize);
    
    const batchPromises = milestoneBatch.map(async (milestone) => {
      // Validate milestone resources
      if (!validateMilestoneResources(milestone.resources, projectData.resources)) {
        throw new Error(`Milestone ${milestone.name} resources must be a subset of project resources`);
      }

      const newMilestone: ProcessedProjectMilestone = {
        ...milestone,
        id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'open',
        dcsMapping: []
      };

      // Create milestones in repositories in parallel with rate limiting
      const repoBatchSize = 3;
      for (let j = 0; j < milestone.resources.length; j += repoBatchSize) {
        const repoBatch = milestone.resources.slice(j, j + repoBatchSize);
        const repoPromises = repoBatch.map(async (repoName) => {
          try {
            const dcsResponse = await createMilestone(
              PROJECTS_REPO_ORG,
              repoName,
              milestone.name,
              token
            );

            return {
              repoName,
              milestoneId: dcsResponse.id.toString()
            };
          } catch (error) {
            console.error(`Failed to create milestone in repo ${repoName}:`, error);
            return null;
          }
        });

        const mappingResults = await Promise.all(repoPromises);
        const validMappings = mappingResults.filter((mapping): mapping is DCSMilestoneMapping => mapping !== null);
        newMilestone.dcsMapping.push(...validMappings);

        // Add delay between repository batches
        if (j + repoBatchSize < milestone.resources.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return newMilestone;
    });

    const batchResults = await Promise.all(batchPromises);
    processedMilestones.push(...batchResults);

    // Add delay between milestone batches
    if (i + batchSize < projectData.milestones.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Update the project data with processed milestones
  const processedProjectData = {
    ...projectData,
    milestones: processedMilestones
  };

  const projectBody = getFormattedJsonString(processedProjectData);

  const projectsFolderExists = await checkProjectsRepoExists();
  if (!projectsFolderExists) {
    await createProjectsRepo(token);
  }
  const projectExists = await checkProjectExists(processedProjectData.name);
  if (projectExists) {
    throw new Error(`Project ${processedProjectData.name} already exists`);
  }

  const validName = processedProjectData.name.replace(/[^a-zA-Z0-9]/g, '-');
  const result = await createFileInRepo(PROJECTS_REPO_NAME, PROJECTS_REPO_ORG, token, `projects/active/${validName}.json`, projectBody);
  await updateProjectList(token);
  return result;
}

// Function to get organization resources
async function getOrganizationResources(token: string): Promise<string[]> {
  // For now, we'll get all repositories in the organization as resources
  const response = await fetch(`https://qa.door43.org/api/v1/orgs/${PROJECTS_REPO_ORG}/repos`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch organization resources');
  }

  const repos = await response.json() as Repository[];
  return repos.map(repo => repo.name);
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
  const { data: project, path } = await getProject(projectName);
  const result = await updateFileInRepo(PROJECTS_REPO_NAME, PROJECTS_REPO_ORG, token, path, projectBody, project.sha);
  await updateProjectList(token);
  return result;
}

export async function archiveProject(token: string, projectName: string): Promise<FileContentResponse> {
  const { data: project, path } = await getProject(projectName);
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

// Milestone Management Functions
export async function addMilestoneToProject(
  token: string,
  projectName: string,
  milestone: Omit<ProjectMilestone, 'id' | 'dcsMapping'>
): Promise<FileContentResponse> {
  // Get the current project
  const { data: projectFile, path } = await getProject(projectName);
  const projectData = JSON.parse(atob(projectFile.content)) as ProcessedProjectData;

  // Create a new milestone with a unique ID
  const newMilestone: ProcessedProjectMilestone = {
    ...milestone,
    id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'open',
    dcsMapping: []
  };

  // Create the milestone in each associated repository
  for (const repoName of milestone.resources) {
    try {
      const dcsResponse = await createMilestone(
        PROJECTS_REPO_ORG,
        repoName,
        milestone.name,
        token
      );

      // Add the mapping to the milestone
      newMilestone.dcsMapping.push({
        repoName,
        milestoneId: dcsResponse.id.toString()
      });
    } catch (error) {
      console.error(`Failed to create milestone in repo ${repoName}:`, error);
      // Continue with other repos even if one fails
    }
  }

  // Add the milestone to the project
  projectData.milestones.push(newMilestone);

  // Update the project file
  const result = await updateFileInRepo(
    PROJECTS_REPO_NAME,
    PROJECTS_REPO_ORG,
    token,
    path,
    getFormattedJsonString(projectData),
    projectFile.sha
  );

  await updateProjectList(token);
  return result;
}

export async function updateProjectMilestone(
  token: string,
  projectName: string,
  milestoneId: string,
  updates: Partial<Omit<ProjectMilestone, 'id' | 'dcsMapping'>>
): Promise<FileContentResponse> {
  // Get the current project
  const { data: projectFile, path } = await getProject(projectName);
  const projectData = JSON.parse(atob(projectFile.content)) as ProcessedProjectData;

  // Find the milestone
  const milestoneIndex = projectData.milestones.findIndex(m => m.id === milestoneId);
  if (milestoneIndex === -1) {
    throw new Error(`Milestone ${milestoneId} not found in project ${projectName}`);
  }

  const milestone = projectData.milestones[milestoneIndex];

  // Update the milestone in DCS for each repository
  for (const mapping of milestone.dcsMapping) {
    try {
      await updateMilestone(
        PROJECTS_REPO_ORG,
        mapping.repoName,
        token,
        mapping.milestoneId,
        updates.name || milestone.name
      );
    } catch (error) {
      console.error(`Failed to update milestone in repo ${mapping.repoName}:`, error);
      // Continue with other repos even if one fails
    }
  }

  // Update the milestone in our project
  projectData.milestones[milestoneIndex] = {
    ...milestone,
    ...updates,
    dcsMapping: milestone.dcsMapping
  };

  // Update the project file
  const result = await updateFileInRepo(
    PROJECTS_REPO_NAME,
    PROJECTS_REPO_ORG,
    token,
    path,
    getFormattedJsonString(projectData),
    projectFile.sha
  );

  await updateProjectList(token);
  return result;
}

export async function closeProjectMilestone(
  token: string,
  projectName: string,
  milestoneId: string
): Promise<FileContentResponse> {
  // Get the current project
  const { data: projectFile, path } = await getProject(projectName);
  const projectData = JSON.parse(atob(projectFile.content)) as ProcessedProjectData;

  // Find the milestone
  const milestoneIndex = projectData.milestones.findIndex(m => m.id === milestoneId);
  if (milestoneIndex === -1) {
    throw new Error(`Milestone ${milestoneId} not found in project ${projectName}`);
  }

  const milestone = projectData.milestones[milestoneIndex];

  // Close the milestone in DCS for each repository
  for (const mapping of milestone.dcsMapping) {
    try {
      await closeMilestone(
        PROJECTS_REPO_ORG,
        mapping.repoName,
        token,
        mapping.milestoneId
      );
    } catch (error) {
      console.error(`Failed to close milestone in repo ${mapping.repoName}:`, error);
      // Continue with other repos even if one fails
    }
  }

  // Update the milestone status in our project
  projectData.milestones[milestoneIndex] = {
    ...milestone,
    status: 'closed'
  };

  // Update the project file
  const result = await updateFileInRepo(
    PROJECTS_REPO_NAME,
    PROJECTS_REPO_ORG,
    token,
    path,
    getFormattedJsonString(projectData),
    projectFile.sha
  );

  await updateProjectList(token);
  return result;
}

export interface ProjectTask extends Omit<Issue, 'body'> {
  repository: string;
  description?: string;  // renamed from body to be more task-oriented
}

export interface ProjectMilestoneTasksResult {
  total_count: number;
  open_count: number;
  closed_count: number;
  tasks: ProjectTask[];
  fetched_at: string;
  milestone_version: string;
  inconsistent_repos?: string[];
}

// Utility function to create a hash from a string using Web Crypto API
async function createHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getProjectMilestoneTasks(
  projectName: string,
  milestoneId: string,
  token: string
): Promise<ProjectMilestoneTasksResult> {
  // Get the project milestone
  const { data: projectFile } = await getProject(projectName);
  const projectData = JSON.parse(atob(projectFile.content)) as ProcessedProjectData;

  const milestone = projectData.milestones.find(m => m.id === milestoneId);
  if (!milestone) {
    throw new Error(`Milestone ${milestoneId} not found in project ${projectName}`);
  }

  const inconsistentRepos: string[] = [];
  const allTasks: ProjectTask[] = [];

  // Fetch tasks from all mapped DCS milestones in parallel with rate limiting
  const batchSize = 3; // Adjust based on API limits
  for (let i = 0; i < milestone.dcsMapping.length; i += batchSize) {
    const batch = milestone.dcsMapping.slice(i, i + batchSize);

    const batchPromises = batch.map(async (mapping) => {
      try {
        const issues = await getAllMilestoneIssues(
          PROJECTS_REPO_ORG,
          mapping.repoName,
          mapping.milestoneId,
          token
        );

        // Transform issues to tasks with repository context
        return issues.map(issue => ({
          ...issue,
          repository: mapping.repoName,
          description: issue.body
        }));
      } catch (error) {
        console.error(`Error fetching tasks for ${mapping.repoName}:`, error);
        inconsistentRepos.push(mapping.repoName);
        return [];
      }
    });

    const batchResults = await Promise.all(batchPromises);
    allTasks.push(...batchResults.flat());

    // Rate limiting pause between batches
    if (i + batchSize < milestone.dcsMapping.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Calculate counts
  const openCount = allTasks.filter(t => t.state === 'open').length;
  const closedCount = allTasks.filter(t => t.state === 'closed').length;

  // Calculate milestone version for cache invalidation
  const milestoneVersion = await createHash(JSON.stringify(milestone.dcsMapping));

  return {
    total_count: allTasks.length,
    open_count: openCount,
    closed_count: closedCount,
    tasks: allTasks,
    fetched_at: new Date().toISOString(),
    milestone_version: milestoneVersion,
    ...(inconsistentRepos.length && { inconsistent_repos: inconsistentRepos })
  };
}

export interface CreateProjectTaskOptions {
  title: string;
  description?: string;
  assignees?: string[];
  labels?: string[];
  due_date?: string;
}

export async function createProjectMilestoneTask(
  token: string,
  projectName: string,
  milestoneId: string,
  repoName: string,
  options: CreateProjectTaskOptions
): Promise<ProjectTask> {
  // Get the project milestone
  const { data: projectFile } = await getProject(projectName);
  const projectData = JSON.parse(atob(projectFile.content)) as ProcessedProjectData;

  const milestone = projectData.milestones.find(m => m.id === milestoneId);
  if (!milestone) {
    throw new Error(`Milestone ${milestoneId} not found in project ${projectName}`);
  }

  // Find the DCS milestone mapping for the specified repository
  const dcsMapping = milestone.dcsMapping.find(m => m.repoName === repoName);
  if (!dcsMapping) {
    throw new Error(`Milestone is not mapped to repository ${repoName}`);
  }

  // Transform our domain task options to DCS issue options
  const issueOptions: CreateIssueOptions = {
    title: options.title,
    body: options.description,
    assignees: options.assignees,
    labels: options.labels,
    due_date: options.due_date,
    milestone: parseInt(dcsMapping.milestoneId)
  };

  // Create the issue in DCS through the issues adapter layer
  const issue = await createIssue(
    PROJECTS_REPO_ORG,
    repoName,
    issueOptions,
    token
  );

  // Transform the DCS issue into our domain ProjectTask
  return {
    ...issue,
    repository: repoName,
    description: issue.body
  };
}

export async function updateProjectTaskStatus(
  token: string,
  repoName: string,
  taskNumber: number,
  newStatus: 'open' | 'closed'
): Promise<ProjectTask> {
  // Update the issue in DCS through the issues adapter layer
  const issue = await updateIssue(
    PROJECTS_REPO_ORG,
    repoName,
    taskNumber,
    { state: newStatus },
    token
  );

  // Transform the DCS issue into our domain ProjectTask
  return {
    ...issue,
    repository: repoName,
    description: issue.body
  };
}

export async function createProjectTask(
  token: string,
  projectName: string,
  milestoneId: string,
  taskResource: string,
  taskData: {
    title: string;
    description?: string;
    assignees?: string[];
  }
): Promise<ProjectTask> {
  // Get the current project
  const { data: projectFile } = await getProject(projectName);
  const projectData = JSON.parse(atob(projectFile.content)) as ProcessedProjectData;

  // Find the milestone
  const milestone = projectData.milestones.find(m => m.id === milestoneId);
  if (!milestone) {
    throw new Error(`Milestone ${milestoneId} not found in project ${projectName}`);
  }

  // Validate that the task resource is available to the milestone
  if (!validateTaskResource(taskResource, milestone.resources)) {
    throw new Error(`Task resource ${taskResource} must be available to the milestone`);
  }

  // Create the task in DCS
  const mapping = milestone.dcsMapping.find(m => m.repoName === taskResource);
  if (!mapping) {
    throw new Error(`No DCS mapping found for resource ${taskResource} in milestone ${milestone.name}`);
  }

  const issue = await createIssue(
    PROJECTS_REPO_ORG,
    taskResource,
    {
      title: taskData.title,
      body: taskData.description || '',
      milestone: parseInt(mapping.milestoneId),
      assignees: taskData.assignees || []
    },
    token
  );

  // Convert the issue to a ProjectTask
  const task: ProjectTask = {
    ...issue,
    repository: taskResource,
    description: issue.body
  };

  return task;
}

export async function deleteProject(token: string, projectName: string): Promise<void> {
  const { data: project, path } = await getProject(projectName);
  await deleteFileInRepo(PROJECTS_REPO_NAME, project.sha, PROJECTS_REPO_ORG, token, path);
  await updateProjectList(token);
}

export type {
  ProjectData,
  ProcessedProjectData,
  ProcessedProjectMilestone
};

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
