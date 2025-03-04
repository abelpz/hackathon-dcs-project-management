// Types
export interface Issue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at?: string;
  due_date?: string;
  assignees: Array<{
    id: number;
    login: string;
    username: string;
  }>;
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

export interface CreateIssueOptions {
  title: string;
  body?: string;
  assignees?: string[];
  milestone?: number;
  labels?: string[];
  due_date?: string;
}

export interface UpdateIssueOptions {
  title?: string;
  body?: string;
  assignees?: string[];
  milestone?: number;
  labels?: string[];
  state?: 'open' | 'closed';
  due_date?: string;
}

// CRUD Functions
export async function createIssue(
  orgName: string,
  repoName: string,
  options: CreateIssueOptions,
  token: string
): Promise<Issue> {
  const response = await fetch(
    `https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/issues`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create issue: ${response.statusText}`);
  }

  return response.json();
}

export async function getIssue(
  orgName: string,
  repoName: string,
  issueNumber: number,
  token: string
): Promise<Issue> {
  const response = await fetch(
    `https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/issues/${issueNumber}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get issue: ${response.statusText}`);
  }

  return response.json();
}

export async function updateIssue(
  orgName: string,
  repoName: string,
  issueNumber: number,
  options: UpdateIssueOptions,
  token: string
): Promise<Issue> {
  const response = await fetch(
    `https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/issues/${issueNumber}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update issue: ${response.statusText}`);
  }

  return response.json();
}

export async function getMilestoneIssues(
  orgName: string,
  repoName: string,
  milestoneId: string,
  token: string,
  state: 'open' | 'closed' | 'all' = 'all',
  page = 1,
  limit = 30
): Promise<Issue[]> {
  const response = await fetch(
    `https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/issues?milestone=${milestoneId}&state=${state}&page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get milestone issues: ${response.statusText}`);
  }

  return response.json();
}

// Helper function to get all issues (handles pagination)
export async function getAllMilestoneIssues(
  orgName: string,
  repoName: string,
  milestoneId: string,
  token: string,
  state: 'open' | 'closed' | 'all' = 'all'
): Promise<Issue[]> {
  const limit = 100;
  let page = 1;
  let allIssues: Issue[] = [];
  let hasMore = true;
  
  while (hasMore) {
    const issues = await getMilestoneIssues(orgName, repoName, milestoneId, token, state, page, limit);
    if (issues.length === 0) {
      hasMore = false;
    } else {
      allIssues = allIssues.concat(issues);
      page++;
    }
  }
  
  return allIssues;
} 