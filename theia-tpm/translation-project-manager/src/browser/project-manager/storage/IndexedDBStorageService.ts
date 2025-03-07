// import { injectable } from 'inversify';
// import type { IStorageService, CreateOrganizationInput, CreateProjectInput, CreateMilestoneInput, CreateTaskInput, CreateResourceInput, CreateUserInput, CreateTeamInput } from '../types';
// import type { Organization, Project, Milestone, Task, Resource, User, Team } from '../models';

// @injectable()
// export class IndexedDBStorageService implements IStorageService {
//   private readonly DB_NAME = 'project-manager-db';
//   private readonly DB_VERSION = 1;
//   private db: IDBDatabase | null = null;

//   private readonly STORES = {
//     ORGANIZATIONS: 'organizations',
//     PROJECTS: 'projects',
//     MILESTONES: 'milestones',
//     TASKS: 'tasks',
//     RESOURCES: 'resources',
//     USERS: 'users',
//     TEAMS: 'teams'
//   };

//   async initialize(): Promise<void> {
//     if (this.db) return;

//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => {
//         this.db = request.result;
//         resolve();
//       };

//       request.onupgradeneeded = () => {
//         const db = request.result;
        
//         // Create object stores if they don't exist
//         if (!db.objectStoreNames.contains(this.STORES.ORGANIZATIONS)) {
//           db.createObjectStore(this.STORES.ORGANIZATIONS, { keyPath: 'id' });
//         }
        
//         if (!db.objectStoreNames.contains(this.STORES.PROJECTS)) {
//           db.createObjectStore(this.STORES.PROJECTS, { keyPath: 'id' });
//         }
        
//         if (!db.objectStoreNames.contains(this.STORES.MILESTONES)) {
//           db.createObjectStore(this.STORES.MILESTONES, { keyPath: 'id' });
//         }
        
//         if (!db.objectStoreNames.contains(this.STORES.TASKS)) {
//           db.createObjectStore(this.STORES.TASKS, { keyPath: 'id' });
//         }
        
//         if (!db.objectStoreNames.contains(this.STORES.RESOURCES)) {
//           db.createObjectStore(this.STORES.RESOURCES, { keyPath: 'id' });
//         }
        
//         if (!db.objectStoreNames.contains(this.STORES.USERS)) {
//           db.createObjectStore(this.STORES.USERS, { keyPath: 'id' });
//         }
        
//         if (!db.objectStoreNames.contains(this.STORES.TEAMS)) {
//           db.createObjectStore(this.STORES.TEAMS, { keyPath: 'id' });
//         }
//       };
//     });
//   }

//   private generateId(): string {
//     return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
//   }

//   private async transaction<T>(
//     storeName: string,
//     mode: IDBTransactionMode,
//     callback: (store: IDBObjectStore) => IDBRequest<T>
//   ): Promise<T> {
//     if (!this.db) {
//       throw new Error('Database not initialized');
//     }

//     return new Promise((resolve, reject) => {
//       const transaction = this.db!.transaction(storeName, mode);
//       const store = transaction.objectStore(storeName);
//       const request = callback(store);

//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   }

//   // Organization operations
//   async createOrganization(input: CreateOrganizationInput): Promise<Organization> {
//     const organization: Organization = {
//       ...input,
//       teamIds: input.teamIds || [], // Ensure teamIds is always an array
//       id: this.generateId()
//     };

//     await this.transaction(
//       this.STORES.ORGANIZATIONS,
//       'readwrite',
//       (store) => store.add(organization)
//     );

//     return organization;
//   }

//   async getOrganization(id: string): Promise<Organization | null> {
//     return this.transaction(
//       this.STORES.ORGANIZATIONS,
//       'readonly',
//       store => store.get(id)
//     );
//   }

//   async updateOrganization(org: Organization): Promise<Organization> {
//     await this.transaction(
//       this.STORES.ORGANIZATIONS,
//       'readwrite',
//       store => store.put(org)
//     );
//     return org;
//   }

//   async deleteOrganization(id: string): Promise<void> {
//     await this.transaction(
//       this.STORES.ORGANIZATIONS,
//       'readwrite',
//       store => store.delete(id)
//     );
//   }

//   async getAllOrganizations(): Promise<Organization[]> {
//     return this.transaction(
//       this.STORES.ORGANIZATIONS,
//       'readonly',
//       store => store.getAll()
//     );
//   }

//   // Project operations
//   async createProject(input: CreateProjectInput): Promise<Project> {
//     const project: Project = {
//       ...input,
//       id: this.generateId(),
//       status: input.status || 'active'
//     };

//     await this.transaction(
//       this.STORES.PROJECTS,
//       'readwrite',
//       store => store.add(project)
//     );

//     return project;
//   }

//   async getProject(id: string): Promise<Project | null> {
//     return this.transaction(
//       this.STORES.PROJECTS,
//       'readonly',
//       store => store.get(id)
//     );
//   }

//   async updateProject(project: Project): Promise<Project> {
//     await this.transaction(
//       this.STORES.PROJECTS,
//       'readwrite',
//       store => store.put(project)
//     );
//     return project;
//   }

//   async deleteProject(id: string): Promise<void> {
//     await this.transaction(
//       this.STORES.PROJECTS,
//       'readwrite',
//       store => store.delete(id)
//     );
//   }

//   async getAllProjects(): Promise<Project[]> {
//     return this.transaction(
//       this.STORES.PROJECTS,
//       'readonly',
//       store => store.getAll()
//     );
//   }

//   async getProjectsByOrganization(orgId: string): Promise<Project[]> {
//     const allProjects = await this.getAllProjects();
//     return allProjects.filter(project => project.organizationId === orgId);
//   }

//   async getProjectsByTeam(teamId: string): Promise<Project[]> {
//     const allProjects = await this.getAllProjects();
//     return allProjects.filter(project => project.teamId === teamId);
//   }

//   // Milestone operations
//   async createMilestone(input: CreateMilestoneInput): Promise<Milestone> {
//     const milestone: Milestone = {
//       ...input,
//       id: this.generateId()
//     };

//     await this.transaction(
//       this.STORES.MILESTONES,
//       'readwrite',
//       store => store.add(milestone)
//     );

//     return milestone;
//   }

//   async getMilestone(id: string): Promise<Milestone | null> {
//     return this.transaction(
//       this.STORES.MILESTONES,
//       'readonly',
//       store => store.get(id)
//     );
//   }

//   async updateMilestone(milestone: Milestone): Promise<Milestone> {
//     await this.transaction(
//       this.STORES.MILESTONES,
//       'readwrite',
//       store => store.put(milestone)
//     );
//     return milestone;
//   }

//   async deleteMilestone(id: string): Promise<void> {
//     await this.transaction(
//       this.STORES.MILESTONES,
//       'readwrite',
//       store => store.delete(id)
//     );
//   }

//   async getAllMilestones(): Promise<Milestone[]> {
//     return this.transaction(
//       this.STORES.MILESTONES,
//       'readonly',
//       store => store.getAll()
//     );
//   }

//   async getMilestonesByProject(projectId: string): Promise<Milestone[]> {
//     const allMilestones = await this.getAllMilestones();
//     return allMilestones.filter(milestone => milestone.projectId === projectId);
//   }

//   async getMilestonesByTeam(teamId: string): Promise<Milestone[]> {
//     const allMilestones = await this.getAllMilestones();
//     return allMilestones.filter(milestone => milestone.teamId === teamId);
//   }

//   // Task operations
//   async createTask(input: CreateTaskInput): Promise<Task> {
//     const task: Task = {
//       ...input,
//       id: this.generateId()
//     };

//     await this.transaction(
//       this.STORES.TASKS,
//       'readwrite',
//       store => store.add(task)
//     );

//     return task;
//   }

//   async getTask(id: string): Promise<Task | null> {
//     return this.transaction(
//       this.STORES.TASKS,
//       'readonly',
//       store => store.get(id)
//     );
//   }

//   async updateTask(task: Task): Promise<Task> {
//     await this.transaction(
//       this.STORES.TASKS,
//       'readwrite',
//       store => store.put(task)
//     );
//     return task;
//   }

//   async deleteTask(id: string): Promise<void> {
//     await this.transaction(
//       this.STORES.TASKS,
//       'readwrite',
//       store => store.delete(id)
//     );
//   }

//   async getAllTasks(): Promise<Task[]> {
//     return this.transaction(
//       this.STORES.TASKS,
//       'readonly',
//       store => store.getAll()
//     );
//   }

//   async getTasksByMilestone(milestoneId: string): Promise<Task[]> {
//     const allTasks = await this.getAllTasks();
//     return allTasks.filter(task => task.milestoneId === milestoneId);
//   }

//   async getTasksByUser(userId: string): Promise<Task[]> {
//     const allTasks = await this.getAllTasks();
//     return allTasks.filter(task => task.assignedUserIds.includes(userId));
//   }

//   async clearAllData(): Promise<void> {
//     if (!this.db) throw new Error('Database not initialized');

//     const storeNames = Object.values(this.STORES);
//     const transaction = this.db.transaction(storeNames, 'readwrite');

//     await Promise.all(
//       storeNames.map(
//         storeName => new Promise<void>((resolve, reject) => {
//           const request = transaction.objectStore(storeName).clear();
//           request.onsuccess = () => resolve();
//           request.onerror = () => reject(request.error);
//         })
//       )
//     );
//   }

//   async close(): Promise<void> {
//     if (this.db) {
//       this.db.close();
//       this.db = null;
//     }
//   }

//   // Resource operations
//   async createResource(input: CreateResourceInput): Promise<Resource> {
//     const resource: Resource = {
//       ...input,
//       id: this.generateId()
//     };
    
//     await this.transaction(
//       this.STORES.RESOURCES,
//       'readwrite',
//       store => store.add(resource)
//     );
    
//     return resource;
//   }

//   async getResource(id: string): Promise<Resource | null> {
//     return this.transaction(
//       this.STORES.RESOURCES,
//       'readonly',
//       store => store.get(id)
//     );
//   }

//   async updateResource(resource: Resource): Promise<Resource> {
//     await this.transaction(
//       this.STORES.RESOURCES,
//       'readwrite',
//       store => store.put(resource)
//     );
    
//     return resource;
//   }

//   async deleteResource(id: string): Promise<void> {
//     await this.transaction(
//       this.STORES.RESOURCES,
//       'readwrite',
//       store => store.delete(id)
//     );
//   }

//   async getAllResources(): Promise<Resource[]> {
//     return this.transaction(
//       this.STORES.RESOURCES,
//       'readonly',
//       store => store.getAll()
//     );
//   }

//   async getResourcesByOrganization(orgId: string): Promise<Resource[]> {
//     const allResources = await this.getAllResources();
//     return allResources.filter(resource => resource.organizationId === orgId);
//   }

//   // User operations
//   async createUser(input: CreateUserInput): Promise<User> {
//     const user: User = {
//       ...input,
//       id: this.generateId()
//     };

//     await this.transaction(
//       this.STORES.USERS,
//       'readwrite',
//       store => store.add(user)
//     );

//     return user;
//   }

//   async getUser(id: string): Promise<User | null> {
//     try {
//       return await this.transaction(
//         this.STORES.USERS,
//         'readonly',
//         store => store.get(id)
//       );
//     } catch (error) {
//       console.error('Error getting user:', error);
//       return null;
//     }
//   }

//   async updateUser(user: User): Promise<User> {
//     await this.transaction(
//       this.STORES.USERS,
//       'readwrite',
//       store => store.put(user)
//     );

//     return user;
//   }

//   async deleteUser(id: string): Promise<void> {
//     await this.transaction(
//       this.STORES.USERS,
//       'readwrite',
//       store => store.delete(id)
//     );
//   }

//   async getAllUsers(): Promise<User[]> {
//     return this.transaction(
//       this.STORES.USERS,
//       'readonly',
//       store => store.getAll()
//     );
//   }

//   async getUsersByOrganization(orgId: string): Promise<User[]> {
//     const allUsers = await this.getAllUsers();
//     return allUsers.filter(user => user.organizationId === orgId);
//   }

//   async getUsersByTeam(teamId: string): Promise<User[]> {
//     const team = await this.getTeam(teamId);
//     if (!team) return [];
    
//     const users: User[] = [];
//     for (const userId of team.userIds) {
//       const user = await this.getUser(userId);
//       if (user) users.push(user);
//     }
    
//     return users;
//   }

//   // Team operations
//   async createTeam(input: CreateTeamInput): Promise<Team> {
//     const team: Team = {
//       ...input,
//       id: this.generateId()
//     };

//     await this.transaction(
//       this.STORES.TEAMS,
//       'readwrite',
//       store => store.add(team)
//     );

//     return team;
//   }

//   async getTeam(id: string): Promise<Team | null> {
//     try {
//       return await this.transaction(
//         this.STORES.TEAMS,
//         'readonly',
//         store => store.get(id)
//       );
//     } catch (error) {
//       console.error('Error getting team:', error);
//       return null;
//     }
//   }

//   async updateTeam(team: Team): Promise<Team> {
//     await this.transaction(
//       this.STORES.TEAMS,
//       'readwrite',
//       store => store.put(team)
//     );

//     return team;
//   }

//   async deleteTeam(id: string): Promise<void> {
//     await this.transaction(
//       this.STORES.TEAMS,
//       'readwrite',
//       store => store.delete(id)
//     );
//   }

//   async getAllTeams(): Promise<Team[]> {
//     return this.transaction(
//       this.STORES.TEAMS,
//       'readonly',
//       store => store.getAll()
//     );
//   }

//   async getTeamsByOrganization(orgId: string): Promise<Team[]> {
//     const allTeams = await this.getAllTeams();
//     return allTeams.filter(team => team.organizationId === orgId);
//   }
// } 