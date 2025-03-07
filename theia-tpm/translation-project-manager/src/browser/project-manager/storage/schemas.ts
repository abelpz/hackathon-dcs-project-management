/* import { RxJsonSchema } from 'rxdb';
import type { Organization, Project, Milestone, Task, Resource, User, Team } from '../models';

export const userSchema: RxJsonSchema<User> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        type: {
            type: 'string',
            enum: ['user']
        },
        name: {
            type: 'string'
        },
        email: {
            type: 'string'
        },
        organizationId: {
            type: 'string'
        },
        avatarUrl: {
            type: 'string'
        }
    },
    required: ['id', 'type', 'name', 'email', 'organizationId', 'avatarUrl'],
    indexes: ['name', 'email', 'organizationId']
};

export const teamSchema: RxJsonSchema<Team> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        type: {
            type: 'string',
            enum: ['team']
        },
        name: {
            type: 'string'
        },
        organizationId: {
            type: 'string'
        },
        userIds: {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    },
    required: ['id', 'type', 'name', 'organizationId', 'userIds'],
    indexes: ['name', 'organizationId']
};

export const organizationSchema: RxJsonSchema<Organization> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        type: {
            type: 'string',
            enum: ['organization']
        },
        name: {
            type: 'string'
        },
        teamIds: {
            type: 'array',
            items: {
                type: 'string'
            },
            default: []
        }
    },
    required: ['id', 'type', 'name', 'teamIds'],
    indexes: ['name']
};

export const projectSchema: RxJsonSchema<Project> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        type: {
            type: 'string',
            enum: ['project']
        },
        name: {
            type: 'string'
        },
        organizationId: {
            type: 'string'
        },
        teamId: {
            type: 'string'
        },
        sourceResources: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        targetResources: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        status: {
            type: 'string',
            enum: ['active', 'complete', 'archived']
        },
        description: {
            type: 'string'
        }
    },
    required: ['id', 'type', 'name', 'organizationId', 'teamId', 'sourceResources', 'targetResources', 'status'],
    indexes: ['name', 'organizationId', 'teamId', 'status']
};

export const milestoneSchema: RxJsonSchema<Milestone> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        type: {
            type: 'string',
            enum: ['milestone']
        },
        name: {
            type: 'string'
        },
        projectId: {
            type: 'string'
        },
        teamId: {
            type: 'string'
        },
        resourceScope: {
            type: 'array',
            items: {
                type: 'string'
            },
            description: 'Subset of project resource IDs that can be affected by this milestone'
        }
    },
    required: ['id', 'type', 'name', 'projectId', 'teamId', 'resourceScope'],
    indexes: ['name', 'projectId', 'teamId']
};

export const taskSchema: RxJsonSchema<Task> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        type: {
            type: 'string',
            enum: ['task']
        },
        name: {
            type: 'string'
        },
        milestoneId: {
            type: 'string'
        },
        assignedUserIds: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        resourceId: {
            type: 'string',
            description: 'ID of the single resource from milestone scope that this task affects'
        },
        status: {
            type: 'string',
            enum: ['open', 'closed']
        },
        description: {
            type: 'string'
        }
    },
    required: ['id', 'type', 'name', 'milestoneId', 'assignedUserIds', 'resourceId', 'status'],
    indexes: ['name', 'milestoneId', 'resourceId', 'status']
};

export const resourceSchema: RxJsonSchema<Resource> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        type: {
            type: 'string',
            enum: ['resource']
        },
        name: {
            type: 'string'
        },
        path: {
            type: 'string'
        },
        organizationId: {
            type: 'string'
        },
        contentType: {
            type: 'string'
        },
        language: {
            type: 'string'
        },
        version: {
            type: 'string'
        }
    },
    required: ['id', 'type', 'name', 'path', 'organizationId', 'contentType', 'language'],
    indexes: ['name', 'organizationId', 'contentType', 'language']
};  */