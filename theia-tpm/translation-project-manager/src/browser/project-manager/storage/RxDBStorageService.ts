// import { injectable } from 'inversify';
// import {
//     createRxDatabase,
//     type RxDatabase,
//     type RxCollection
// } from 'rxdb';
// import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
// import { v4 as uuidv4 } from 'uuid';
// import { addRxPlugin } from 'rxdb';
// import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

// import type { IStorageService, CreateOrganizationInput, CreateProjectInput, CreateMilestoneInput, CreateTaskInput, CreateResourceInput, CreateUserInput, CreateTeamInput } from '../types';
// import type { Organization, Project, Milestone, Task, Resource, User, Team } from '../models';
// import { organizationSchema, projectSchema, milestoneSchema, taskSchema, resourceSchema, userSchema, teamSchema } from './schemas';

// // Add dev mode plugin if in development
// if (process.env.NODE_ENV !== 'production') {
//     addRxPlugin(RxDBDevModePlugin);
// }

// interface DatabaseCollections {
//     organizations: RxCollection<Organization>;
//     projects: RxCollection<Project>;
//     milestones: RxCollection<Milestone>;
//     tasks: RxCollection<Task>;
//     resources: RxCollection<Resource>;
//     users: RxCollection<User>;
//     teams: RxCollection<Team>;
// }

// @injectable()
// export class RxDBStorageService implements IStorageService {
//     private db: RxDatabase<DatabaseCollections> | null = null;

//     async initialize(): Promise<void> {
//         if (this.db) return;

//         this.db = await createRxDatabase<DatabaseCollections>({
//             name: 'projectmanagerdb',
//             storage: getRxStorageDexie(),
//             cleanupPolicy: {
//                 minimumCollectionAge: 1000 * 60 * 60 * 24 * 7 // 1 week
//             }
//         });

//         await this.db.addCollections({
//             organizations: {
//                 schema: organizationSchema
//             },
//             projects: {
//                 schema: projectSchema
//             },
//             milestones: {
//                 schema: milestoneSchema
//             },
//             tasks: {
//                 schema: taskSchema
//             },
//             resources: {
//                 schema: resourceSchema
//             },
//             users: {
//                 schema: userSchema
//             },
//             teams: {
//                 schema: teamSchema
//             }
//         });
//     }

//     async clearAllData(): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.remove();
//         this.db = null;
//     }

//     async close(): Promise<void> {
//         if (!this.db) return;
//         await this.db.remove();
//         this.db = null;
//     }

//     // Organization operations
//     async createOrganization(input: CreateOrganizationInput): Promise<Organization> {
//         if (!this.db) throw new Error('Database not initialized');
        
//         const organization: Organization = {
//             id: uuidv4(),
//             ...input,
//             teamIds: input.teamIds || []
//         };

//         await this.db.organizations.insert(organization);
//         return organization;
//     }

//     async getOrganization(id: string): Promise<Organization | null> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.organizations.findOne(id).exec() || null;
//     }

//     async updateOrganization(org: Organization): Promise<Organization> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.organizations.upsert(org);
//         return org;
//     }

//     async deleteOrganization(id: string): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.organizations.findOne(id).remove();
//     }

//     async getAllOrganizations(): Promise<Organization[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         const organizations = await this.db.organizations.find().exec();
//         return organizations;
//     }

//     // Validation methods
//     private async validateProjectResourceScope(organizationId: string, sourceResources: string[], targetResources: string[]): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');
        
//         const organization = await this.db.organizations.findOne(organizationId).exec();
//         if (!organization) {
//             throw new Error(`Organization ${organizationId} not found`);
//         }

//         // Fetch organization's repositories from DCS API
//         const response = await fetch(`https://qa.door43.org/api/v1/orgs/${organization.name}/repos`);
//         if (!response.ok) {
//             throw new Error(`Failed to fetch organization repositories: ${response.statusText}`);
//         }

//         const repos = await response.json() as Array<{ name: string }>;
//         const validResourceIds = repos.map(repo => repo.name);

//         // Check if all resource IDs exist in the organization's repositories
//         const allResources = [...sourceResources, ...targetResources];
//         const invalidResources = allResources.filter(id => !validResourceIds.includes(id));
//         if (invalidResources.length > 0) {
//             throw new Error(`Invalid resource IDs: ${invalidResources.join(', ')}. Resources must be valid repositories in the organization.`);
//         }
//     }

//     private async validateMilestoneResourceScope(projectId: string, resourceScope: string[]): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');
        
//         const project = await this.db.projects.findOne(projectId).exec();
//         if (!project) {
//             throw new Error(`Project ${projectId} not found`);
//         }

//         // Ensure that all milestone resource IDs are included in the project's target resources
//         const invalidResources = resourceScope.filter(id => !project.targetResources.includes(id));
//         if (invalidResources.length > 0) {
//             throw new Error(`Invalid resource IDs: ${invalidResources.join(', ')}. Milestone resources must be a subset of the project's target resources.`);
//         }
//     }

//     private async validateTaskResource(milestoneId: string, resourceId: string): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');

//         const milestone = await this.db.milestones.findOne(milestoneId).exec();
//         if (!milestone) {
//             throw new Error(`Milestone ${milestoneId} not found`);
//         }

//         if (!milestone.resourceScope.includes(resourceId)) {
//             throw new Error(`Invalid resource ID for task: ${resourceId}. Must be one of milestone's resources.`);
//         }
//     }

//     // Add validation methods
//     private async validateTeamMembership(teamId: string, userIds: string[]): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');

//         const team = await this.db.teams.findOne(teamId).exec();
//         if (!team) {
//             throw new Error(`Team ${teamId} not found`);
//         }

//         for (const userId of userIds) {
//             if (!team.userIds.includes(userId)) {
//                 throw new Error(`User ${userId} is not a member of team ${teamId}`);
//             }
//         }
//     }

//     private async validateProjectTeam(organizationId: string, teamId: string): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');

//         const organization = await this.db.organizations.findOne(organizationId).exec();
//         if (!organization) {
//             throw new Error(`Organization ${organizationId} not found`);
//         }

//         if (!organization.teamIds.includes(teamId)) {
//             throw new Error(`Team ${teamId} is not part of organization ${organizationId}`);
//         }
//     }

//     private async validateMilestoneTeam(projectId: string, teamId: string): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');

//         const project = await this.db.projects.findOne(projectId).exec();
//         if (!project) {
//             throw new Error(`Project ${projectId} not found`);
//         }

//         // Milestone team must match project team
//         if (project.teamId !== teamId) {
//             throw new Error(`Milestone team ${teamId} must match project team ${project.teamId}`);
//         }
//     }

//     private async validateTaskAssignees(milestoneId: string, userIds: string[]): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');

//         const milestone = await this.db.milestones.findOne(milestoneId).exec();
//         if (!milestone) {
//             throw new Error(`Milestone ${milestoneId} not found`);
//         }

//         // Validate that all assigned users are part of the milestone team
//         await this.validateTeamMembership(milestone.teamId, userIds);
//     }

//     // Project operations
//     async createProject(input: CreateProjectInput): Promise<Project> {
//         if (!this.db) throw new Error('Database not initialized');
        
//         await this.validateProjectResourceScope(input.organizationId, input.sourceResources, input.targetResources);
//         await this.validateProjectTeam(input.organizationId, input.teamId);
        
//         const project: Project = {
//             id: uuidv4(),
//             ...input,
//             status: input.status || 'active'
//         };

//         await this.db.projects.insert(project);
//         return project;
//     }

//     async getProject(id: string): Promise<Project | null> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.projects.findOne(id).exec() || null;
//     }

//     async updateProject(project: Project): Promise<Project> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.projects.upsert(project);
//         return project;
//     }

//     async deleteProject(id: string): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.projects.findOne(id).remove();
//     }

//     async getAllProjects(): Promise<Project[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         const projects = await this.db.projects.find().exec();
//         return projects;
//     }

//     async getProjectsByOrganization(orgId: string): Promise<Project[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         const projects = await this.db.projects.find({
//             selector: {
//                 organizationId: orgId
//             }
//         }).exec();
//         return projects;
//     }

//     async getProjectsByTeam(teamId: string): Promise<Project[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.projects.find({
//             selector: {
//                 teamId: teamId
//             }
//         }).exec();
//     }

//     // Milestone operations
//     async createMilestone(input: CreateMilestoneInput): Promise<Milestone> {
//         if (!this.db) throw new Error('Database not initialized');
        
//         await this.validateMilestoneResourceScope(input.projectId, input.resourceScope);
//         await this.validateMilestoneTeam(input.projectId, input.teamId);
        
//         const milestone: Milestone = {
//             id: uuidv4(),
//             ...input
//         };

//         await this.db.milestones.insert(milestone);
//         return milestone;
//     }

//     async getMilestone(id: string): Promise<Milestone | null> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.milestones.findOne(id).exec() || null;
//     }

//     async updateMilestone(milestone: Milestone): Promise<Milestone> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.milestones.upsert(milestone);
//         return milestone;
//     }

//     async deleteMilestone(id: string): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.milestones.findOne(id).remove();
//     }

//     async getAllMilestones(): Promise<Milestone[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         const milestones = await this.db.milestones.find().exec();
//         return milestones;
//     }

//     async getMilestonesByProject(projectId: string): Promise<Milestone[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         const milestones = await this.db.milestones.find({
//             selector: {
//                 projectId: projectId
//             }
//         }).exec();
//         return milestones;
//     }

//     async getMilestonesByTeam(teamId: string): Promise<Milestone[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.milestones.find({
//             selector: {
//                 teamId: teamId
//             }
//         }).exec();
//     }

//     // Task operations
//     async createTask(input: CreateTaskInput): Promise<Task> {
//         if (!this.db) throw new Error('Database not initialized');
        
//         await this.validateTaskResource(input.milestoneId, input.resourceId);
//         await this.validateTaskAssignees(input.milestoneId, input.assignedUserIds);
        
//         const task: Task = {
//             id: uuidv4(),
//             ...input
//         };

//         await this.db.tasks.insert(task);
//         return task;
//     }

//     async getTask(id: string): Promise<Task | null> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.tasks.findOne(id).exec() || null;
//     }

//     async updateTask(task: Task): Promise<Task> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.tasks.upsert(task);
//         return task;
//     }

//     async deleteTask(id: string): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.tasks.findOne(id).remove();
//     }

//     async getAllTasks(): Promise<Task[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         const tasks = await this.db.tasks.find().exec();
//         return tasks;
//     }

//     async getTasksByMilestone(milestoneId: string): Promise<Task[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         const tasks = await this.db.tasks.find({
//             selector: {
//                 milestoneId: milestoneId
//             }
//         }).exec();
//         return tasks;
//     }

//     async getTasksByUser(userId: string): Promise<Task[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.tasks.find().exec()
//             .then(tasks => tasks.filter(task => task.assignedUserIds.includes(userId)));
//     }

//     // Resource operations
//     async createResource(input: CreateResourceInput): Promise<Resource> {
//         if (!this.db) throw new Error('Database not initialized');
        
//         const resource: Resource = {
//             id: uuidv4(),
//             ...input
//         };

//         await this.db.resources.insert(resource);
//         return resource;
//     }

//     async getResource(id: string): Promise<Resource | null> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.resources.findOne(id).exec() || null;
//     }

//     async updateResource(resource: Resource): Promise<Resource> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.resources.upsert(resource);
//         return resource;
//     }

//     async deleteResource(id: string): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');
//         const resource = await this.db.resources.findOne(id).exec();
//         if (resource) {
//             await resource.remove();
//         }
//     }

//     async getAllResources(): Promise<Resource[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         const resources = await this.db.resources.find().exec();
//         return resources;
//     }

//     async getResourcesByOrganization(orgId: string): Promise<Resource[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         const resources = await this.db.resources.find({
//             selector: {
//                 organizationId: orgId
//             }
//         }).exec();
//         return resources;
//     }

//     // User operations
//     async createUser(input: CreateUserInput): Promise<User> {
//         if (!this.db) throw new Error('Database not initialized');

//         const user: User = {
//             id: uuidv4(),
//             ...input
//         };

//         await this.db.users.insert(user);
//         return user;
//     }

//     async getUser(id: string): Promise<User | null> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.users.findOne(id).exec() || null;
//     }

//     async updateUser(user: User): Promise<User> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.users.upsert(user);
//         return user;
//     }

//     async deleteUser(id: string): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');
//         const user = await this.db.users.findOne(id).exec();
//         if (user) {
//             await user.remove();
//         }
//     }

//     async getAllUsers(): Promise<User[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.users.find().exec();
//     }

//     async getUsersByOrganization(orgId: string): Promise<User[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.users.find({
//             selector: {
//                 organizationId: orgId
//             }
//         }).exec();
//     }

//     async getUsersByTeam(teamId: string): Promise<User[]> {
//         if (!this.db) throw new Error('Database not initialized');
        
//         const team = await this.db.teams.findOne(teamId).exec();
//         if (!team) return [];
        
//         const users = await Promise.all(
//             team.userIds.map(userId => this.getUser(userId))
//         );
        
//         return users.filter((user): user is User => user !== null);
//     }

//     // Team operations
//     async createTeam(input: CreateTeamInput): Promise<Team> {
//         if (!this.db) throw new Error('Database not initialized');

//         // Verify that all users exist and belong to the organization
//         for (const userId of input.userIds) {
//             const user = await this.db.users.findOne(userId).exec();
//             if (!user) {
//                 throw new Error(`User ${userId} not found`);
//             }
//             if (user.organizationId !== input.organizationId) {
//                 throw new Error(`User ${userId} does not belong to organization ${input.organizationId}`);
//             }
//         }

//         const team: Team = {
//             id: uuidv4(),
//             ...input
//         };

//         await this.db.teams.insert(team);

//         // Update the organization to include this team
//         const org = await this.db.organizations.findOne(input.organizationId).exec();
//         if (org) {
//             await this.db.organizations.upsert({
//                 ...org.toJSON(),
//                 teamIds: [...org.teamIds, team.id]
//             });
//         }

//         return team;
//     }

//     async getTeam(id: string): Promise<Team | null> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.teams.findOne(id).exec() || null;
//     }

//     async updateTeam(team: Team): Promise<Team> {
//         if (!this.db) throw new Error('Database not initialized');
//         await this.db.teams.upsert(team);
//         return team;
//     }

//     async deleteTeam(id: string): Promise<void> {
//         if (!this.db) throw new Error('Database not initialized');
//         const team = await this.db.teams.findOne(id).exec();
        
//         if (team) {
//             // Remove this team from the organization
//             const org = await this.db.organizations.findOne(team.organizationId).exec();
//             if (org) {
//                 await this.db.organizations.upsert({
//                     ...org.toJSON(),
//                     teamIds: org.teamIds.filter(teamId => teamId !== id)
//                 });
//             }
            
//             await team.remove();
//         }
//     }

//     async getAllTeams(): Promise<Team[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.teams.find().exec();
//     }

//     async getTeamsByOrganization(orgId: string): Promise<Team[]> {
//         if (!this.db) throw new Error('Database not initialized');
//         return await this.db.teams.find({
//             selector: {
//                 organizationId: orgId
//             }
//         }).exec();
//     }
// } 