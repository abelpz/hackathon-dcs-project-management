// Domain Models for Project Management System

export interface User {
    id: string;
    name: string;
    email: string;
    organizationId: string;
    avatarUrl?: string;
}

export interface Team {
    id: string;
    name: string;
    description?: string;
    organizationId: string;
    userIds: string[]; // IDs of users in this team
}

export interface Organization {
    id: string;
    type: 'organization';
    name: string;
}

export interface Resource {
    id: string;
    type: 'resource';
    name: string;
    path: string;
    organizationId: string;
    contentType: string; // e.g., 'scripture', 'dictionary', 'notes', etc.
    language: string;
    version?: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    organizationId: string;
    teamId: string; // ID of the team assigned to this project
    sourceResources: string[]; // IDs of source resources used as input
    targetResources: string[]; // IDs of target resources being created/modified
    status: 'active' | 'complete' | 'archived';
}

export interface Milestone {
    id: string;
    type: 'milestone';
    name: string;
    projectId: string;
    teamId?: string; // ID of the team assigned to this milestone (must be same as project team or a subteam)
    resourceScope: string[]; // Subset of project resource IDs that can be affected by this milestone
    status: 'open' | 'closed';
}

export interface Task {
    id: string;
    type: 'task';
    name: string;
    milestoneId: string;
    assignedUserIds: string[]; // IDs of users assigned to this task (must be members of the milestone's team)
    resourceId: string; // ID of the single resource from milestone scope that this task affects
    status: 'open' | 'closed';
    description?: string;
} 