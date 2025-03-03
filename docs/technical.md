# Technical Details

This document outlines the technical architecture, components, and implementation details of the Biblical Translation Project Management System. A central design principle of the system is the adapter architecture, which creates a flexible abstraction layer between our application logic and backend services such as Door43 Content Service (DCS). This approach ensures that while we initially leverage DCS's robust infrastructure, the system remains flexible enough to integrate with other platforms in the future.

## Repository Structure

All resources in the Book Translation Package live in Git repositories hosted in the Door43 Content Service (DCS) at git.door43.org. For the Spanish (Latin American) Gateway Language, we have an organization set up as `es-419_gl` (git.door43.org/es-419_gl).

Within this organization, each resource type has its own dedicated repository:

- **Simplified Books (es-419_gl/es-419_gst)**: Contains every book, one file per book in USFM format.
- **Literal Books (es-419_gl/es-419_glt)**: Contains every book, one file per book in USFM format.
- **Translation Notes (es-419_gl/es-419_tn)**: Contains a file per book in TSV format, each file containing all the notes for one book.
- **Translation Academy (es-419_gl/es-419_ta)**: Contains a manual for translating the Bible, with each file representing an article. Articles are not specifically related to a book of the Bible but rather concepts useful across multiple passages. Translation notes usually refer to Translation Academy articles.
- **Translation Words (es-419_gl/es-419_tw)**: Contains multiple dictionary entries, one per file. These are reusable across different books and passages in the Bible.
- **Translation Questions (es-419_gl/es-419_tq)**: Like translation notes, these are in TSV format with one file per book, each file containing all questions and answers for a book.

This repository structure facilitates modular development, version control, and collaboration while maintaining clear organization of the different resource types.

## Technical Stack

- **Platform**: Eclipse Theia
  - Extensible, open-source platform for developing cloud & desktop IDE-like applications
  - Built with TypeScript and the same architecture that powers VS Code
  - Provides highly customizable web-based development experience

- **Frontend**: React with TypeScript
  - Used within the Theia framework for custom UI components

- **Browser-First Architecture**:
  - Designed to run primarily in the browser without requiring a dedicated backend
  - Leverages browser storage APIs and direct API calls to DCS
  - Supports optional backend integration for organizations that require it

- **Extensions**: Distributed via npm
  - Created as separate packages for modular functionality
  - Shareable with other Theia applications
  - Follows standard Theia extension development patterns

- **Template System**:
  - Templates stored in DCS in the 'project-management' repository
  - Downloaded and applied client-side
  - Customizable by organizations

- **API Integration**: DCS API (git.door43.org/api/swagger)
  - RESTful API integration with Door43 Content Service through adapter layer

- **Authentication**: OAuth integration with DCS
  - Single sign-on capabilities leveraging DCS authentication
  - Extensible to support other authentication providers through adapter layer

## Theia Extension Architecture

The Biblical Translation Project Management System is built as a custom Eclipse Theia application with a set of extensions that implement the specific functionality needed for translation project management. This approach offers several advantages:

### Extension-Based Design

The system is structured as a collection of Theia extensions:

- **Core Extension**: Provides the basic framework and adapter interfaces
- **DCS Adapter Extension**: Implements the DCS-specific adapter functionality
- **Template Extension**: Manages project templates from the DCS 'project-management' repository
- **Dashboard Extension**: Provides project overview and tracking capabilities
- **Repository Extension**: Enhances Theia's existing Git capabilities for translation-specific needs
- **Content Editor Extensions**: Specialized editors for USFM, TSV, and Markdown formats

### Template System

Rather than a fixed workflow engine, the system uses a flexible template approach:

- **Templates hosted in DCS**: All project templates are stored in the 'project-management' repository within the organization on DCS
- **Client-side processing**: Templates are downloaded and processed in the browser
- **Customizable structure**: Organizations can modify templates to match their specific processes
- **Version control**: Template changes are tracked through standard Git version control
- **Template categories**:
  - Book Translation Package templates
  - Milestone templates
  - Task templates
  - Quality check templates

### npm Distribution

All extensions are packaged and distributed via npm, offering several benefits:

1. **Reusability**: Other Theia-based applications can incorporate our extensions
2. **Versioning**: Clear dependency management and upgrade paths
3. **Modularity**: Organizations can choose which extensions to include
4. **Discoverability**: Standard npm discovery mechanisms apply
5. **CI/CD Integration**: Simplified release processes using standard npm workflows

### Extension Configuration

Extensions can be configured through standard Theia configuration mechanisms:

```json
{
  "dcs-adapter": {
    "apiUrl": "https://git.door43.org/api/v1",
    "defaultOrganization": "es-419_gl"
  },
  "template-system": {
    "templateRepository": "project-management",
    "refreshInterval": 3600,
    "defaultTemplate": "book-translation-package"
  }
}
```

### Custom Theia Commands

The extensions provide custom Theia commands that can be triggered from the command palette, menus, or programmatically:

- `template:apply` - Apply a project template to create resources
- `template:customize` - Customize an existing template
- `template:sync` - Synchronize templates with the remote repository
- `dcs:syncRepository` - Synchronize with DCS repositories

### Extension Points

Our extensions expose extension points that allow for further customization:

- **Custom Milestone Validators**: Add specialized validation rules
- **Report Templates**: Define custom reporting formats
- **Workflow Hooks**: Insert custom actions at specific points in the workflow
- **Custom Editors**: Add support for additional file formats

This extension-based architecture ensures that the Biblical Translation Project Management System can be easily extended and customized while allowing individual components to be reused in other Theia-based applications.

### Benefits of Theia for Biblical Translation Project Management

Eclipse Theia provides unique advantages for the Biblical Translation Project Management System:

1. **Built-in Git Integration**: Theia includes robust Git capabilities out of the box, which we can extend for DCS-specific needs without building version control from scratch

2. **IDE-like Experience**: Translators and reviewers benefit from IDE features like syntax highlighting, validation, and rich text editing for various formats (USFM, Markdown, etc.)

3. **Desktop and Cloud Deployment**: Theia applications can run as desktop applications or cloud-hosted services, enabling both online and offline translation work

4. **File System Access**: Direct integration with local and remote file systems simplifies working with translation resource repositories

5. **Extension Ecosystem**: We can leverage existing Theia/VS Code extensions for additional functionality:
   - Markdown preview extensions for documentation
   - Diff viewers for comparing translations
   - Collaboration extensions for real-time editing

6. **Language Support**: Built-in support for internationalization facilitates creating a fully translated UI for translators from different language backgrounds

7. **Customizable Layout**: Theia's flexible layout system enables us to create specialized workbenches for different phases of the translation process:
   - Drafting workbench with source text and target editor
   - Review workbench with comparison views
   - Alignment workbench with specialized alignment tools

8. **Web Technologies**: Being built on web technologies makes it easier to integrate with web-based services like DCS and support browser-based workflows

9. **Open Source**: The open-source nature of Theia aligns with the collaborative, community-driven approach of biblical translation projects

These advantages make Theia an ideal platform for building specialized tools for the complex workflows involved in biblical translation project management.

## Door43 Content Service (DCS) Integration

Our system integrates with the Door43 Content Service API through our adapter architecture to manage biblical content and project workflows. This approach allows us to leverage DCS's robust infrastructure while maintaining flexibility for future backend changes.

### Repository Management

- Creation and management of git repositories for each translation project
- Branch and tag management for version control
- Permission management for collaborators
- Tracking repository status and metadata through our adapter layer

### Content Access and Modification

- Reading and writing content to repositories
- Handling different file formats including Markdown, USFM, and other biblical text formats
- Managing content structure and organization
- Abstracting file operations through our domain-specific interfaces

### Project Management Features

- **Issues**: Leveraging DCS's issue tracking system to manage translation tasks
- **Milestones**: Mapping our 8-milestone process to DCS milestone objects
- **Pull Requests**: Using PR workflows for review processes
- **Reviews**: Implementing formal reviews through the DCS review mechanism
- **Teams**: Integrating with DCS team structures for role-based access

### User Authentication

- OAuth-based authentication with DCS
- User role and permission management
- Team and organization integration
- Adapter-based identity management for potential multi-system support

### Version Control Operations

- Commit history tracking
- Diff generation and visualization
- Merge request handling
- Conflict resolution support

### Adapter Implementation

Our DCS adapter implementations will map these DCS-specific concepts to our application's domain model. For example:

- A Book Translation Package task might become a DCS issue with specific labels and metadata
- Translation milestones map to DCS milestone objects with custom properties
- Component interdependencies are tracked through issue relationships and labels

This approach provides the benefits of DCS's robust infrastructure while maintaining the flexibility to potentially integrate with other systems in the future.

## System Architecture

The system follows a modular architecture with the following components:

1. **Authentication Module**
   - Handles user authentication and session management
   - Integrates with DCS OAuth
   - Runs entirely in the browser using OAuth implicit flow

2. **Project Management Module**
   - Manages projects, tasks, and assignments
   - Tracks progress through milestones
   - Provides dashboard and reporting capabilities
   - Uses browser storage for offline capabilities

3. **Template Management Module**
   - Downloads and applies templates from the DCS 'project-management' repository
   - Processes template definitions client-side
   - Allows customization and saving of templates
   - Implements the 8-milestone process as configurable templates

4. **Content Management Module**
   - Interacts directly with DCS API for repository operations
   - Manages content versioning and synchronization
   - Provides content editing and reviewing interfaces
   - Implements offline caching with synchronization

5. **Collaboration Module**
   - Handles comments, notifications, and communications
   - Provides polling for updates on project activities
   - Facilitates interactions between team members through DCS

### Browser-First Implementation

The system is designed to run primarily in the browser:

1. **Direct DCS API Integration**
   - Browser makes authenticated calls directly to the DCS API
   - Uses OAuth tokens stored securely in browser storage

2. **Local Storage & IndexedDB**
   - Caches repositories, templates, and user data
   - Enables offline work without a backend
   - Implements sync logic for reconciling changes

3. **Optional Backend Integration**
   - Defines standard interfaces for backend communication
   - Allows organizations to implement custom backends
   - Supports proxy authentication for enhanced security

4. **Progressive Web App**
   - Service workers for offline capabilities
   - Background sync for changes made offline
   - Local notifications for important events

This browser-first architecture ensures the application can run without complex server infrastructure while still providing rich functionality through the DCS API and client-side processing.

## Adapter Layer Architecture

The Biblical Translation Project Management System implements the adapter pattern to create a flexible abstraction layer between our application and backend systems like Door43 Content Service (DCS). This architecture enables future extensibility and system portability.

### Adapter Pattern Overview

```
Application Layer
      ↑
      |
Adapter Interface Layer
      ↑
   /  |  \
DCS   |   Future
Adapter  Adapters
```

This pattern provides several key benefits:

- **Decoupling**: The application logic remains independent of any specific backend implementation
- **Extensibility**: Support for new backends requires only implementing the adapter interfaces
- **Testability**: Easy to create mock implementations for testing
- **Flexibility**: Organizations can integrate with their preferred project management tools

### Core Adapter Interfaces

The system defines clear interfaces for each project management capability:

```typescript
// Core interfaces
interface IRepositoryService {
  getRepository(org: string, repo: string): Promise<Repository>;
  listRepositories(org: string): Promise<Repository[]>;
  createPullRequest(repo: Repository, title: string, description: string, ...): Promise<PullRequest>;
  // Other repository operations
}

interface IIssueService {
  createIssue(repo: Repository, title: string, description: string, ...): Promise<Issue>;
  assignIssue(issue: Issue, assignee: User): Promise<void>;
  getIssuesByMilestone(milestone: Milestone): Promise<Issue[]>;
  // Other issue operations
}

interface IMilestoneService {
  createMilestone(repo: Repository, title: string, description: string, ...): Promise<Milestone>;
  updateMilestoneProgress(milestone: Milestone, progress: number): Promise<void>;
  // Other milestone operations
}

// Additional interfaces for reviews, teams, etc.
```

### DCS Implementation

The initial implementation will work with Door43 Content Service:

```typescript
class DCSRepositoryService implements IRepositoryService {
  constructor(private dcsClient: DCSApiClient) {}
  
  async getRepository(org: string, repo: string): Promise<Repository> {
    // Call DCS API to get repository data
    const dcsRepo = await this.dcsClient.repos.get(org, repo);
    // Map DCS response to your domain model
    return mapDCSRepositoryToRepository(dcsRepo);
  }
  
  // Implement other methods...
}

// Similar implementations for other services
```

### Domain-Specific Adapters

The system also implements higher-level adapters for Book Translation Package-specific concepts:

```typescript
interface ITranslationPackageService {
  createBookTranslationPackage(language: string, book: BiblicalBook): Promise<TranslationPackage>;
  advanceToNextMilestone(package: TranslationPackage): Promise<void>;
  getComponentProgress(package: TranslationPackage, component: PackageComponent): Promise<number>;
  // Other domain-specific operations
}

// Implemented by composing the lower-level services
class DCSTranslationPackageService implements ITranslationPackageService {
  constructor(
    private repoService: IRepositoryService,
    private issueService: IIssueService,
    private milestoneService: IMilestoneService
  ) {}
  
  // Implementation maps domain concepts to appropriate
  // repositories, issues, milestones, etc. in DCS
}
```

### Configuration Management

To support multiple backend configurations, the system uses a factory pattern:

```typescript
// Factory for creating the right implementation
class ProjectManagementServiceFactory {
  static createServices(config: AppConfig): {
    repositoryService: IRepositoryService,
    issueService: IIssueService,
    // etc.
  } {
    if (config.backend === 'dcs') {
      const dcsClient = new DCSApiClient(config.dcsApiUrl, config.authToken);
      return {
        repositoryService: new DCSRepositoryService(dcsClient),
        issueService: new DCSIssueService(dcsClient),
        // etc.
      };
    } else if (config.backend === 'github') {
      // Create GitHub implementations
    } else {
      // Handle other backends
    }
  }
}
```

### Configuration Data Model

The system defines a clear configuration model for specifying backend preferences:

```typescript
interface BackendConfig {
  type: 'dcs' | 'github' | 'gitlab' | 'custom';
  apiUrl: string;
  authMethod: 'oauth' | 'token' | 'basic';
  // Other common config
  
  // Backend-specific config sections
  dcsSpecific?: {
    // DCS-specific settings
  };
  githubSpecific?: {
    // GitHub-specific settings
  };
  // etc.
}
```

### Benefits of the Adapter Approach

1. **Portable Code**: The application core is not tied to DCS-specific features
2. **Simplified Migration**: Moving to another backend requires implementing new adapters, not rewriting application logic
3. **Multiple Backend Support**: Organizations can connect to their preferred project management tools
4. **Future-Proofing**: As project management tools evolve, only adapter implementations need updating
5. **Consistent Domain Model**: Application logic works with translation-specific concepts regardless of backend

## Alternative Backend Options

The adapter architecture enables the Biblical Translation Project Management System to potentially support multiple backend systems. While the initial implementation will integrate with Door43 Content Service (DCS), the design allows for future expansion to other platforms:

### GitHub Integration

GitHub provides similar project management features that could be supported through our adapter layer:

- **GitHub Issues** could manage translation tasks
- **GitHub Projects** could organize the 8-milestone workflow
- **GitHub Actions** could automate validation and publication steps
- **GitHub Teams** could manage contributor roles

### GitLab Integration

GitLab offers comprehensive project management tools that could be leveraged:

- **GitLab Issues** for task tracking
- **GitLab Epics** for organizing milestone groups
- **GitLab CI/CD** for automated validation workflows
- **GitLab Boards** for visualizing translation progress

### Custom Project Management Systems

Organizations with existing project management systems could develop custom adapters:

- **Jira** integration for organizations using Atlassian tools
- **Azure DevOps** for Microsoft-centric organizations
- **Trello** for teams with simpler workflow needs
- **Custom internal systems** through adapter implementations

### Standalone Mode

Future versions could potentially include a standalone mode with built-in project management:

- **Embedded database** for storing project data
- **Native workflow engine** implementing the 8-milestone process
- **Optional synchronization** with external systems
- **Self-contained deployment** for offline or restricted environments

This flexibility ensures that the Biblical Translation Project Management System can adapt to various organizational needs and technology environments while maintaining a consistent user experience and domain model.

## Data Model

The system manages the following key entities, stored primarily in browser storage with synchronization to DCS:

- **Projects**: Book Translation Package projects derived from templates
- **Templates**: Stored in the DCS 'project-management' repository, defining:
  - Milestones structure and dependencies
  - Task templates and assignments
  - Quality check criteria
  - Repository setup
- **Milestones**: The 8 primary milestones and their sub-components as defined in templates
- **Tasks**: Individual work items assigned to team members
- **Resources**: Translation artifacts (GLT, GST, TN, TW, TA, TQ)
- **Users**: System users with roles and permissions
- **Teams**: Groups of users working on specific projects
- **Comments**: Feedback and discussions on content

### Client-Side Storage

The browser-first architecture uses several storage mechanisms:

- **Local Storage**: 
  - User preferences
  - Authentication tokens
  - Recently accessed projects
  
- **IndexedDB**:
  - Cached repository content
  - Template data
  - Work in progress
  - Pending changes
  
- **DCS Integration**:
  - Primary data storage through repositories
  - Issues for tasks
  - Milestones for project phases
  - Comments for collaboration

This hybrid approach enables offline work while ensuring all critical data is eventually synchronized to DCS for persistence and collaboration.

## Cross-Repository Project Management

The Biblical Translation Project Management System uses a centralized approach to manage projects that span multiple repositories within a DCS organization. This is implemented through a special repository called `project-manager` within each organization.

### Understanding DCS API Constraints

After analyzing the [DCS API](https://git.door43.org/api/swagger), we've identified several key characteristics that shape our project management approach:

1. **Repository-Specific Issues and Milestones**: The DCS API manages issues and milestones at the repository level, with no built-in cross-repository project concept
2. **Label-Based Organization**: Labels provide a flexible way to categorize and filter issues across repositories
3. **Limited Cross-Repository Querying**: There's no single API call to retrieve issues from multiple repositories simultaneously
4. **No Native Dependency Tracking**: DCS has no built-in mechanism for tracking dependencies between issues in different repositories

These constraints necessitate our centralized YAML definition approach to provide cross-repository project management capabilities.

### Project Definition Structure

The `project-manager` repository contains structured YAML definitions for projects that coordinate work across multiple repositories:

```yaml
# projects/genesis-btp.yaml
id: genesis-btp-2023
name: "Genesis Book Translation Package"
description: "Create all components of the Genesis Book Translation Package"
type: book-translation-package
book: GEN
language: es-419

# These repositories will be involved in this project
repositories:
  - repo: es-419_gl/es-419_glt
    role: "Literal Translation"
  - repo: es-419_gl/es-419_gst
    role: "Simplified Translation"
  - repo: es-419_gl/es-419_tn
    role: "Translation Notes"
  - repo: es-419_gl/es-419_ta
    role: "Translation Academy"
  - repo: es-419_gl/es-419_tw
    role: "Translation Words"
  - repo: es-419_gl/es-419_tq
    role: "Translation Questions"

# Milestone definitions with repository scoping
milestones:
  - id: milestone-1-drafting
    name: "Milestone 1: Drafting Phase"
    description: "Initial drafting of literal and simplified translations"
    due_date: "2023-10-01"
    # Only create this milestone in these repositories
    repositories: 
      - es-419_gl/es-419_glt
      - es-419_gl/es-419_gst
    
  - id: milestone-2-review
    name: "Milestone 2: Initial Review Phase" 
    description: "Peer and team reviews of drafted translations"
    due_date: "2023-11-01"
    repositories: 
      - es-419_gl/es-419_glt
      - es-419_gl/es-419_gst
    
  - id: milestone-5-supporting
    name: "Milestone 5: Supporting Resources Translation"
    description: "Creation of supporting resources"
    due_date: "2023-12-15"
    repositories:
      - es-419_gl/es-419_tn
      - es-419_gl/es-419_ta
      - es-419_gl/es-419_tw
      - es-419_gl/es-419_tq
  
  # Additional milestones...

# Define common task types that can be used across repositories and milestones
task_types:
  - id: draft
    name: "Drafting Task"
    description: "Initial drafting of content"
    labels: ["drafting"]
    estimate_hours: 40
    
  - id: peer-review
    name: "Peer Review Task"
    description: "Review by peer translator"
    labels: ["review", "peer"]
    estimate_hours: 20
    
  # Additional task types...

# Define logical dependencies between tasks (to be enforced by the app)
dependencies:
  - from:
      repository: es-419_gl/es-419_glt
      milestone: milestone-1-drafting
      task_type: draft
    to:
      repository: es-419_gl/es-419_glt
      milestone: milestone-2-review
      task_type: peer-review
      
  # Cross-repository dependencies
  - from:
      repository: es-419_gl/es-419_glt
      milestone: milestone-2-review
    to:
      repository: es-419_gl/es-419_tn
      milestone: milestone-5-supporting
      
  # More dependencies...

# Project-wide labels to be used consistently across repositories
labels:
  - name: "project:genesis-btp"
    color: "#ff0000"
    description: "Genesis Book Translation Package"
  - name: "milestone:1-drafting"
    color: "#00ff00"
    description: "Milestone 1: Drafting Phase"
  - name: "milestone:2-review"
    color: "#0000ff" 
    description: "Milestone 2: Initial Review Phase"
  # Additional labels...
```

Notice that milestones are now scoped to specific repositories. For example, the "Milestone 1: Drafting Phase" only applies to the literal and simplified translation repositories, while "Milestone 5: Supporting Resources Translation" applies to the supporting resource repositories. This ensures that each repository only contains milestones that are relevant to its specific role in the project.

### Project Template System

The `project-manager` repository also contains template definitions that can be used to create new projects:

```yaml
# templates/book-translation-package.yaml
id: btp-template
name: "Book Translation Package Template"
type: template
description: "Template for creating Book Translation Package projects"
parameters:
  - name: BOOK_CODE
    description: "Three-letter book code (e.g., GEN, EXO, LEV)"
    required: true
  - name: LANGUAGE_CODE
    description: "Language code (e.g., es-419)"
    required: true
  - name: START_DATE
    description: "Project start date"
    required: true
  - name: TARGET_DATE
    description: "Target completion date"
    required: true

# Define common reusable task types
task_types:
  - id: translate
    name: "Translation Task"
    description: "Generic translation task template"
    labels: ["translation"]
    estimate_hours: 40
    
  - id: review
    name: "Review Task"
    description: "Generic review task template"
    labels: ["review"]
    estimate_hours: 20
    
  - id: technical-check
    name: "Technical Check"
    description: "Technical validation task template"
    labels: ["technical", "validation"]
    estimate_hours: 15
    
  # Additional common task types...

repositories:
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
    role: "Literal Translation"
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_gst
    role: "Simplified Translation"
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_tn
    role: "Translation Notes"
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_ta
    role: "Translation Academy"
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_tw
    role: "Translation Words"
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_tq
    role: "Translation Questions"

# Template defines the standard 8-milestone structure with repository scoping
# and milestone-specific task type configurations
milestones:
  - id: milestone-1-drafting
    name: "Milestone 1: Drafting Phase"
    description: "Initial drafting of literal and simplified translations"
    due_date_offset: "30" # days from start date
    repositories: 
      - ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
      - ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_gst
    
    # Milestone-specific task types with auto-generation settings
    milestone_tasks:
      - type_ref: translate
        name_override: "Draft Literal Translation"
        repository: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
        labels_add: ["type:glt-draft", "milestone:1-drafting"]
        auto_generate: true
        assignment_strategy: "role_based" # Assign based on team roles
        
      - type_ref: translate
        name_override: "Draft Simplified Translation"
        repository: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_gst
        labels_add: ["type:gst-draft", "milestone:1-drafting"]
        auto_generate: true
        assignment_strategy: "role_based"

  - id: milestone-2-review
    name: "Milestone 2: Initial Review Phase"
    description: "Peer and team reviews of drafted translations"
    due_date_offset: "60"
    repositories: 
      - ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
      - ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_gst
    
    milestone_tasks:
      - type_ref: review
        name_override: "Peer Check of Literal Translation"
        repository: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
        labels_add: ["type:glt-peer-review", "milestone:2-review"]
        auto_generate: true
        depends_on: "milestone-1-drafting.Draft Literal Translation"
        assignment_strategy: "different_than_predecessor" # Assign to someone different than the drafter
        
      - type_ref: review
        name_override: "Team Check of Literal Translation"
        repository: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
        labels_add: ["type:glt-team-review", "milestone:2-review"]
        auto_generate: true
        depends_on: "milestone-2-review.Peer Check of Literal Translation"
        assignment_strategy: "team_lead"
        
      # More milestone-specific tasks...
  
  # Additional milestones with their specific task configurations...
```

This hybrid approach offers several advantages for project management:

1. **Reusable Task Type Definitions**: Core task types are defined once at the project level
2. **Milestone-Specific Customization**: Each milestone can customize task types for its specific needs
3. **Automatic Task Generation**: The `auto_generate` flag allows the system to create tasks automatically when a project is set up
4. **Clear Dependencies**: Task dependencies can be specified both at the project level and within milestone-specific task definitions
5. **Flexible Assignment Strategies**: Different strategies for assigning tasks can be specified for each task type in a milestone
6. **Semantic Labeling**: Structured naming patterns for labels enable advanced filtering and automation

### Semantic Labeling Strategy

The system implements a semantic labeling strategy with clear prefixes that denote the label's purpose:

- `project:name` - Identifies which project an issue belongs to (e.g., `project:genesis-btp`)
- `milestone:id` - Identifies the milestone an issue belongs to (e.g., `milestone:1-drafting`)
- `type:resource-task` - Identifies the specific task type (e.g., `type:glt-draft`, `type:tn-creation`)
- `role:name` - Identifies which role should work on this task (e.g., `role:translator`, `role:reviewer`)
- `status:state` - For additional status information beyond open/closed (e.g., `status:blocked`, `status:needs-review`)
- `priority:level` - Indicates task priority (e.g., `priority:high`, `priority:medium`)

This approach offers several advantages:

1. **Machine-Readable Format**: The application can easily parse and categorize labels
2. **Powerful Filtering**: Users can filter by label prefix (e.g., show all `type:glt-*` tasks)
3. **Visual Organization**: Labels are naturally grouped in the UI when alphabetically sorted
4. **Automated Processing**: The application can dynamically create and assign labels using consistent patterns
5. **Consistent Naming**: Enforces team-wide conventions for labeling
6. **Query Optimization**: Enables more efficient API queries using label combinations

The application will automatically generate and apply these semantic labels when creating issues from templates, ensuring consistency across repositories and making project management more efficient.

### Key Benefits of the Cross-Repository Approach

1. **Unified Project View**: Provides a single definition that spans all repositories involved in a Book Translation Package
2. **Repository-Appropriate Milestones**: Each repository contains only the milestones that are relevant to its role
3. **Dependency Tracking**: Explicit dependencies between tasks and milestones across repositories
4. **Progress Monitoring**: Centralized tracking of project status across multiple repositories
5. **Team Coordination**: Clearly defined roles and responsibilities across repositories
6. **Automated Setup**: Project templates can be applied to rapidly set up new book projects
7. **Efficiency**: No unnecessary milestones cluttering repositories where they don't apply
8. **Semantic Labeling**: Structured naming patterns for labels enable advanced filtering and automation

### Implementation in the Theia Application

Within our Theia-based application, the `project-manager` repository content is:

1. **Downloaded and parsed** at application startup or on-demand
2. **Analyzed to determine relevant repositories and milestones**
3. **Used to set up or synchronize DCS issues, milestones, and labels**
4. **Referenced for dependency validation and workflow enforcement**
5. **Consulted for unified project reporting and visualization**

This approach allows teams to manage complex, multi-repository projects like Book Translation Packages with a unified interface while maintaining the modular repository structure that facilitates parallel work and clear separation of concerns.

## DCS Wiki Integration for Reporting

The Biblical Translation Project Management System leverages the DCS wiki API for generating and storing project reports, providing a clean separation between project configuration data and the reports generated from that data.

### Wiki-Based Reporting Strategy

Rather than committing reports to the main repository, the system uses the wiki associated with the `project-manager` repository as a dedicated space for project documentation and reporting:

1. **Clean Git History**: Keeps the main repository history focused on meaningful template and configuration changes
2. **Separation of Concerns**: 
   - Main repo: Project definitions, templates, configurations
   - Wiki: Generated reports, status updates, project documentation
3. **Better Collaboration Experience**: Team members can find reports in a dedicated space
4. **Markdown Support**: DCS wikis support Markdown for well-formatted reports with tables and diagrams
5. **Versioned Documentation**: Wiki changes are still version-controlled, but separate from the main repository

### Types of Wiki Reports

The system can generate several types of reports in the wiki:

1. **Project Overview Reports**:
   ```
   project-status-{project-id}
   ```
   - Summary of all repositories involved
   - Progress across all milestones
   - Team assignment overview
   - Timeline visualization

2. **Milestone Reports**:
   ```
   milestone-report-{project-id}-{milestone-id}
   ```
   - Detailed status of a specific milestone
   - Tasks completed/pending
   - Issues or blockers
   - Quality metrics

3. **Repository-Specific Reports**:
   ```
   repository-report-{project-id}-{repo-name}
   ```
   - Focus on a single repository's contributions to the project
   - Resource completion status

4. **Team Reports**:
   ```
   team-report-{project-id}
   ```
   - Member assignments and workload
   - Productivity metrics
   - Collaboration patterns

### Wiki API Implementation

The application uses the DCS API's wiki endpoints to programmatically generate and update reports:

```typescript
async function generateAndUploadProjectReport(
  owner: string, 
  repo: string, 
  projectId: string
): Promise<void> {
  // 1. Generate report content in Markdown
  const reportContent = generateProjectStatusReport(projectId);
  
  // 2. Format the wiki page name
  const pageName = `project-status-${projectId}`;
  
  // 3. Check if page exists
  try {
    await dcsClient.get(`/repos/${owner}/${repo}/wiki/page/${pageName}`);
    // Page exists, update it
    await dcsClient.patch(`/repos/${owner}/${repo}/wiki/page/${pageName}`, {
      title: `Project Status: ${projectId}`,
      content: reportContent,
      message: `Update project status report - ${new Date().toISOString()}`
    });
  } catch (error) {
    // Page doesn't exist, create it
    await dcsClient.post(`/repos/${owner}/${repo}/wiki/new`, {
      title: `Project Status: ${projectId}`,
      content: reportContent,
      message: `Initial project status report`
    });
  }
}
```

### Report Visualizations

Wiki-based reports include rich visualizations created with Markdown extensions:

1. **Progress Charts**: Using Mermaid diagrams to visualize completion percentages
   ```markdown
   ```mermaid
   pie title Milestone 1 Completion
       "Completed" : 45
       "In Progress" : 30
       "Not Started" : 25
   ```
   ```

2. **Timeline Charts**: Visualizing project schedule and dependencies
   ```markdown
   ```mermaid
   gantt
       title Genesis BTP Timeline
       dateFormat  YYYY-MM-DD
       section Milestone 1
       Drafting GLT    :done, m1-glt, 2023-01-01, 30d
       Drafting GST    :active, m1-gst, 2023-01-15, 30d
       section Milestone 2
       Review GLT      :m2-glt, after m1-glt, 20d
       Review GST      :m2-gst, after m1-gst, 20d
   ```
   ```

3. **Task Dependency Graphs**: Showing relationships between tasks
   ```markdown
   ```mermaid
   graph TD
       A[Draft GLT] --> B[Peer Review GLT]
       B --> C[Team Review GLT]
       A --> D[TN Writing]
       C --> E[Harmonization]
   ```
   ```

### Automated Report Generation

The system generates reports:

1. **On Schedule**: Daily/weekly/monthly summaries
2. **On Milestone Completion**: When milestones are reached
3. **On Demand**: Through the UI when users request specific reports
4. **On Status Change**: When significant project status changes occur

This wiki-based reporting approach ensures that all stakeholders have access to up-to-date project information in a clean, well-organized format without cluttering the project configuration repository.

## Leveraging DCS API for Enhanced Features

The Biblical Translation Project Management System utilizes various endpoints from the Door43 Content Service API to implement advanced features beyond basic repository management. These endpoints enable rich project management capabilities while maintaining the browser-first architecture.

### Project and Repository Management

#### Repository Creation and Configuration
```typescript
// Programmatically create repositories when setting up new projects
async function setupProjectRepositories(project) {
  for (const repo of project.repositories) {
    await dcsClient.post(`/orgs/${project.organization}/repos`, {
      name: repo.name,
      description: repo.description,
      private: repo.private,
      auto_init: true
    });
    
    // Set default branch
    await dcsClient.patch(`/repos/${project.organization}/${repo.name}`, {
      default_branch: "master"
    });
  }
}
```

#### Repository Permissions and Collaborators
The system manages repository access through teams and collaborators:
```typescript
// Add a team to a repository with specific permissions
async function addTeamToRepository(org, repo, teamName, permission) {
  await dcsClient.put(`/repos/${org}/${repo}/teams/${teamName}`, {
    permission: permission // "read", "write", "admin"
  });
}
```

### Content Synchronization Features

#### Direct Content Management
For template synchronization:
```typescript
// Get template content from the project-manager repository
async function getTemplateContent(org, template) {
  const response = await dcsClient.get(
    `/repos/${org}/project-manager/contents/templates/${template}.yaml`
  );
  return Buffer.from(response.content, 'base64').toString('utf8');
}
```

#### Content Verification
```typescript
// Verify that content meets requirements before committing
async function verifyContentAndCommit(org, repo, path, content, message) {
  // First validate locally
  if (!validateContent(content)) {
    throw new Error("Content validation failed");
  }
  
  // Then commit if valid
  await dcsClient.put(`/repos/${org}/${repo}/contents/${path}`, {
    message: message,
    content: Buffer.from(content).toString('base64'),
    branch: "master"
  });
}
```

### Enhanced Project Tracking

#### Cross-Repository Issue Querying
```typescript
// Get all issues across multiple repositories with specific labels
async function getProjectIssues(org, projectLabel) {
  const allIssues = [];
  for (const repo of projectRepos) {
    const issues = await dcsClient.get(
      `/repos/${org}/${repo}/issues?labels=${projectLabel}`
    );
    allIssues.push(...issues.map(issue => ({...issue, repository: repo})));
  }
  return allIssues;
}
```

#### Activity Tracking
```typescript
// Track recent activity across all project repositories
async function getProjectActivity(org, projectRepos) {
  const activity = [];
  for (const repo of projectRepos) {
    // Get commits
    const commits = await dcsClient.get(
      `/repos/${org}/${repo}/commits?limit=10`
    );
    
    // Get issue activity
    const issueActivity = await dcsClient.get(
      `/repos/${org}/${repo}/issues/timeline`
    );
    
    activity.push({
      repository: repo,
      commits: commits,
      issues: issueActivity
    });
  }
  return activity;
}
```

### User Management and Notifications

#### Team Management
```typescript
// Create and manage teams for different roles
async function createProjectTeam(org, projectId, role) {
  const teamName = `${projectId}-${role}`;
  await dcsClient.post(`/orgs/${org}/teams`, {
    name: teamName,
    description: `${role} team for ${projectId}`,
    permission: "write"
  });
  return teamName;
}
```

#### Custom Notifications
Though DCS doesn't provide direct notification creation, the system leverages issues and mentions:
```typescript
// Create notification via issue comment
async function notifyTeam(org, repo, issueNumber, teamName, message) {
  await dcsClient.post(
    `/repos/${org}/${repo}/issues/${issueNumber}/comments`,
    {
      body: `@${teamName} ${message}`
    }
  );
}
```

### Release Management

#### Binary and Package Distribution
```typescript
// Create releases for compiled resources
async function createResourceRelease(org, repo, version, notes, assets) {
  // Create the release
  const release = await dcsClient.post(`/repos/${org}/${repo}/releases`, {
    tag_name: `v${version}`,
    name: `Version ${version}`,
    body: notes,
    draft: false,
    prerelease: false
  });
  
  // Attach assets (e.g., compiled PDFs)
  for (const asset of assets) {
    await dcsClient.post(
      `/repos/${org}/${repo}/releases/${release.id}/assets`,
      asset.data,
      {
        headers: {
          'Content-Type': asset.contentType,
          'Content-Disposition': `attachment; filename=${asset.filename}`
        }
      }
    );
  }
}
```

### Webhook Integration

The system uses webhooks to stay synchronized with changes in DCS:
```typescript
// Register for notifications when repositories are updated
async function setupProjectWebhooks(org, repo, webhookUrl) {
  await dcsClient.post(`/repos/${org}/${repo}/hooks`, {
    type: "gitea",
    config: {
      content_type: "json",
      url: webhookUrl
    },
    events: ["push", "issues", "issue_comment", "pull_request"],
    active: true
  });
}
```

### Authentication Enhancement

#### Personal Access Token Management
```typescript
// Create application-specific tokens for users
async function createUserAccessToken(tokenName, scopes) {
  return await dcsClient.post(`/users/tokens`, {
    name: tokenName,
    scopes: scopes // ["repo", "read:org", etc.]
  });
}
```

By leveraging these DCS API capabilities, the Biblical Translation Project Management System provides a rich set of features that integrate deeply with the DCS platform while maintaining a clean, modular architecture that could be adapted to other Git platforms in the future.

## Security Considerations

- **Authentication**: Secure OAuth implementation with DCS
- **Authorization**: Role-based access control for project resources
- **Data Protection**: Encryption of sensitive data
- **API Security**: Secure token management and request validation

## Deployment Strategy

The Biblical Translation Project Management System, built on Eclipse Theia, supports multiple deployment scenarios:

### Desktop Application

- **Electron-based packaging** for Windows, macOS, and Linux
- **Offline capability** with local Git operations and periodic synchronization
- **Custom installers** for easy distribution to translation teams
- **Auto-update mechanism** to ensure users have the latest features and fixes

### Web Application

- **Static web hosting** requiring no server-side components
- **Progressive Web App (PWA)** capabilities for offline functionality
- **Direct browser-to-DCS communication** using the DCS API
- **Local storage** for caching and offline work

### Hybrid Mode

- **Browser-first approach** with optional backend integration
- **Pluggable backend architecture** for organizations that require additional capabilities
- **Synchronized experience** between desktop and web environments
- **Conflict resolution** for changes made in different environments

### Optional Backend Integration

- **Backend agnostic design** allowing organizations to implement custom backend services
- **Standard API contracts** for backend communication
- **Reference implementations** for common scenarios
- **Authentication proxying** for enhanced security

### npm Extension Distribution

- **Extension versioning** to ensure compatibility
- **Dependency management** through npm
- **Extension registry** for discoverability
- **Installation guides** for other Theia applications wanting to use our extensions

This flexible deployment strategy ensures that the Biblical Translation Project Management System can be used effectively in a variety of contexts, from well-connected translation agencies to remote teams with limited internet access, without requiring complex infrastructure like containers or orchestration platforms.

## Getting Started with Development

[Installation and setup instructions will be added as the project develops]

---

Return to [Documentation Home](./README.md)
