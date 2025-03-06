export const TYPES = {
  // Configuration
  Config: Symbol.for('Config'),

  // DCS Clients
  DCSClient: Symbol.for('DCSClient'),
  RelationalRepoClient: Symbol.for('RelationalRepoClient'),
  MilestoneClient: Symbol.for('MilestoneClient'),
  RepositoryClient: Symbol.for('RepositoryClient'),
  IssueClient: Symbol.for('IssueClient'),

  // Services
  ProjectService: Symbol.for('ProjectService'),
  MilestoneService: Symbol.for('MilestoneService'),

  // Mappers
  MilestoneMapper: Symbol.for('MilestoneMapper'),

  // Repositories
  ProjectRepository: Symbol.for('ProjectRepository'),
  MilestoneRepository: Symbol.for('MilestoneRepository'),
  ResourceRepository: Symbol.for('ResourceRepository'),

  // Infrastructure
  Database: Symbol.for('Database'),
  Logger: Symbol.for('Logger'),
} as const; 