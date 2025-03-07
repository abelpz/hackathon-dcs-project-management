import { Issue, CreateIssueOptions, UpdateIssueOptions, createIssue, getIssue, updateIssue, getMilestoneIssues, getAllMilestoneIssues } from './issues';

// Task Types - Domain specific types that map to DCS Issues
export interface Task extends Omit<Issue, 'body'> {
  repository: string;
  description?: string;  // renamed from body to be more task-oriented
}

export interface CreateTaskOptions extends Omit<CreateIssueOptions, 'body'> {
  description?: string;  // renamed from body
}

export interface UpdateTaskOptions extends Omit<UpdateIssueOptions, 'body'> {
  description?: string;  // renamed from body
}

// Task Management Functions
export async function createTask(
  orgName: string,
  repoName: string,
  options: CreateTaskOptions,
  token: string
): Promise<Task> {
  const issueOptions: CreateIssueOptions = {
    ...options,
    body: options.description
  };

  const issue = await createIssue(orgName, repoName, issueOptions, token);
  
  return {
    ...issue,
    repository: repoName,
    description: issue.body
  };
}

export async function getTask(
  orgName: string,
  repoName: string,
  taskNumber: number,
  token: string
): Promise<Task> {
  const issue = await getIssue(orgName, repoName, taskNumber, token);
  
  return {
    ...issue,
    repository: repoName,
    description: issue.body
  };
}

export async function updateTask(
  orgName: string,
  repoName: string,
  taskNumber: number,
  options: UpdateTaskOptions,
  token: string
): Promise<Task> {
  const issueOptions: UpdateIssueOptions = {
    ...options,
    body: options.description
  };

  const issue = await updateIssue(orgName, repoName, taskNumber, issueOptions, token);
  
  return {
    ...issue,
    repository: repoName,
    description: issue.body
  };
}

export async function getMilestoneTasks(
  orgName: string,
  repoName: string,
  milestoneId: string,
  token: string,
  state: 'open' | 'closed' | 'all' = 'all',
  page = 1,
  limit = 30
): Promise<Task[]> {
  const issues = await getMilestoneIssues(orgName, repoName, milestoneId, token, state, page, limit);
  
  return issues.map(issue => ({
    ...issue,
    repository: repoName,
    description: issue.body
  }));
}

export async function getAllMilestoneTasks(
  orgName: string,
  repoName: string,
  milestoneId: string,
  token: string,
  state: 'open' | 'closed' | 'all' = 'all'
): Promise<Task[]> {
  const issues = await getAllMilestoneIssues(orgName, repoName, milestoneId, token, state);
  
  return issues.map(issue => ({
    ...issue,
    repository: repoName,
    description: issue.body
  }));
} 