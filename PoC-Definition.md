# DCS Project Management System - Proof of Concept Definition

## Overview

This document defines the scope and implementation details for the Proof of Concept (PoC) of the DCS Project Management System, to be developed during a 4-day hackathon. The system will provide a structured approach to managing translation projects through integration with the Door43 Content Service (DCS).

## PoC Teams

The hackathon will be organized into five main teams, each focusing on a specific aspect of the system:

### UI Architecture Team

- **Members**: Leonardo, Daniel, Alexandra
- **Responsibilities**:
  - Design overall UI architecture
  - Create wireframes and mockups
  - Ensure consistent Theia integration
  - Define interaction patterns

### UI Implementation Team

- **Lead**: Daniel, Gabriel, Natalia, Yasnela, Yhania
- **Members**: [Names]
- **Responsibilities**:
  - Implement UI components
  - Build responsive layouts

### Logic/API Team

- **Members**: Ilich, Elías, Abel, Gilberto
- **Responsibilities**:
  - Implement core business logic
  - Develop DCS API integration
  - Handle data management
  - Implement project workflows

### React Integration Team

- **Members**: Elías, Abel
- **Responsibilities**:
  - Set up React development environment
  - Configure build tools and bundling
  - Implement React component architecture
  - Setup state management
  - Wire UI components with business logic
  - Connect UI state with API data
  - Handle data flow between UI and Logic layers
  - Ensure proper component communication

### Theia Extension Team

- **Members**: Abel
- **Responsibilities**:
  - Set up Theia extension structure
  - Implement widget integration with React
  - Create Project Management services from Logic/API Team
  - Handle extension lifecycle
  - Manage workspace integration
  - Ensure proper extension packaging

### Cross-Team Coordination

- Daily standups to track progress
- Shared documentation and design decisions
- Regular integration checkpoints
- Collaborative problem-solving sessions
- UI Architecture reviews with all teams
- Regular React-Theia integration syncs

## Objectives

1. Create a project management tool that integrates directly with DCS repositories
2. Enable project creation with milestones and tasks
3. Provide a clear visualization of project progress
4. Implement as a Theia widget extension
5. Demonstrate the core functionality with real DCS integration

## System Architecture

### Components

1. **UI Layer**: React components with Tailwind CSS
2. **Logic Layer**: Application logic and state management
3. **DCS Adapter**: Interface between our application and DCS API
4. **Theia Extension**: Widget for integration with Theia IDE

### UI Architecture

The application will be implemented as a Theia extension with a focus on minimal workspace impact and seamless integration with the IDE. The UI will be organized into two main areas: the sidebar and the main panel.

#### Sidebar Navigation

**Purpose**: Primary navigation and quick access to all features
**Required Elements**:

1. **Projects Section**
   - Project list with status indicators
   - Project grouping:
     - Active Projects
     - Finished Projects
   - Project milestones list
   - Create Project button

#### Main Panel Tabs (Limited to Essential Views)

**Purpose**: Show only the most critical detailed views that need persistent visibility

1. **Project Details Tab**
   - Project metadata
   - Assigned team members
   - Repository links
   - Basic milestone list
   - Action buttons (edit, delete, create milestone, etc.)

2. **Milestone Details Tab**
   - Milestone metadata
   - Assigned team members
   - Task list
   - Action buttons (edit, delete, etc.)
   - Action buttons (create task, etc.)

#### Status Bar Information

**Purpose**: Show current context and quick actions
**Required Elements**:
- Connection status to DCS
- Current project
- Active tasks count

#### Key UX Considerations

1. **Minimal Tab Usage**
   - Only create tabs for views that need persistent visibility
   - Keep the workspace clean

2. **Sidebar Organization**
   - Collapsible sections
   - Clear hierarchy
   - Visual feedback for current selection

3. **Context Preservation**
   - Remember last viewed items
   - Maintain selection state
   - Preserve filter settings

4. **Integration with Theia**
   - Match Theia's look and feel (styles can be customized with a custom theme through css, but structure should be kept)
   - Use Theia's standard patterns
   - Consistent with IDE workflow

5. **Efficiency**
   - Keyboard shortcuts for common actions
   - Quick navigation
   - Bulk actions


### Data Storage Approach

We will store project metadata in a central repository called `project-manager` with the following structure:

```
/project-manager/
  /projects/
    /active/
      project-abc.json  # Active projects
      project-xyz.json
    /finished/
      project-123.json  # Completed projects
    /archived/
      project-old.json  # Archived projects
```

## Project Data Model

Each project will be defined in a single JSON file with the following structure:

```typescript
interface ProjectDefinition {
  // Core project metadata
  id: string;                 // Unique project identifier
  name: string;               // Human-readable project name
  description: string;        // Detailed project description
  
  // Dates and timeline
  createdAt: string;          // ISO date string of creation
  startDate?: string;         // Optional planned start date
  targetCompletionDate?: string; // Optional target completion date
  actualCompletionDate?: string; // Filled when project is completed
  
  assignedTeam: {
   id: string;
   name: string;
  }

  // Connected repositories (simplified)
  linkedRepositories: {
    repoName: string;         // Name of repository
    orgName: string;          // Organization name
  }[];
  
  // Project milestones
  milestones: {
    id: string;               // Unique milestone identifier
    name: string;             // Milestone name
    description: string;      // Detailed description
    startDate?: string;       // Optional start date
    targetDate?: string;      // Target completion date
    completedDate?: string;   // Actual completion date (if completed)
    
    // DCS milestone mapping
    dcsMapping?: {
      repoName: string;       // Which repo contains the milestone
      milestoneId: number;    // DCS milestone ID
    }[];
  }[];
}
```

## Feature Scope

### In Scope

1. **Project Management**
   - Create new projects
   - View and edit existing projects
   - Move projects between active/finished states

2. **Milestone Management**
   - Create milestones for projects
   - Map milestones to DCS milestones
   - Track milestone progress

3. **Task Management**
   - Create tasks as issues in DCS repositories
   - Add project labels (`project:{project_id}`)
   - Assign tasks to team members
   - Add tasks to milestones

4. **DCS Integration**
   - Authentication with DCS
   - Repository selection and linking
   - Creation of issues with proper labels
   - Creation of milestones in repositories

5. **Visualization**
   - Project dashboard with progress overview
   - Milestone status visualization
   - Task listing with filtering options

### Out of Scope

1. Complex dependency tracking between milestones
2. Advanced progress metrics and reporting
3. Custom fields and project templates
4. Automated task assignment
5. Complex role-based permissions
6. Extensive project analytics

## Technical Implementation Details

### DCS Integration

1. **Authentication**
   - Implement OAuth flow with DCS
   - Store tokens securely for API access

2. **Repository Management**
   - List available repositories in organization
   - Create/access the `project-manager` repository
   - Read/write project definition files

3. **Issues & Milestones**
   - Create issues with project labels
   - Create milestones in linked repositories
   - Track issue status for project progress

### Project Management Flow

1. **Creation Phase**
   - User creates a new project
   - Defines basic metadata
   - Links relevant repositories
   - Creates initial milestones

2. **Task Management**
   - User creates tasks as issues in DCS
   - Each issue is labeled with `project:{project_id}`
   - Issues are assigned to team members
   - Issues are added to relevant milestones

3. **Progress Tracking**
   - System pulls issue status from DCS
   - Calculates milestone completion
   - Visualizes overall project progress

## Team Structure & Timeline

### Day 1

**UI Architecture Team**:

- Create initial wireframes and mockups
- Define UI/UX patterns and guidelines
- Design component specifications
- Establish interaction patterns

**UI Implementation Team**:

- Set up component development environment
- Create base UI components
- Implement responsive layouts
- Build initial UI prototypes

**Logic/API Team**:

- Implement DCS authentication
- Design project data structures
- Create repository access functions
- Define API interfaces

**React Integration Team**:

- Set up React development environment
- Configure build tools and bundling
- Implement base React architecture
- Set up state management structure

**Theia Extension Team**:

- Set up Theia extension structure
- Create basic widget framework
- Plan React-Theia integration points
- Define extension services

### Day 2

**UI Architecture Team**:

- Review and refine UI patterns
- Define additional component specs
- Document interaction flows
- Create UI testing guidelines

**UI Implementation Team**:

- Implement project management components
- Create milestone visualization components
- Build task list components
- Develop form components

**Logic/API Team**:

- Implement project CRUD operations
- Create milestone management functions
- Develop DCS issue creation logic
- Build data transformation layer

**React Integration Team**:

- Wire UI components with business logic
- Implement data flow patterns
- Set up component communication
- Create state management hooks

**Theia Extension Team**:

- Implement widget integration with React
- Create Project Management services
- Develop menu structure
- Set up workspace integration

### Day 3

**UI Architecture Team**:

- Finalize UI patterns
- Document component library
- Create usage guidelines
- Review accessibility compliance

**UI Implementation Team**:

- Implement task management interface
- Create project dashboard
- Build filter and search components
- Add animations and transitions

**Logic/API Team**:

- Implement task/issue management
- Create progress calculation logic
- Develop project state transitions
- Build data synchronization

**React Integration Team**:

- Optimize component communication
- Implement error handling
- Add loading states
- Refine state management

**Theia Extension Team**:

- Complete widget integration
- Implement context actions
- Add workspace features
- Set up extension packaging

### Day 4

**All Teams**:

- Integration testing
- Bug fixing
- UI polish
- Demo preparation
- Documentation finalization

## Demo Flow

1. **Project Creation**
   - Login to DCS
   - Create new project with name and description
   - Link existing repositories
   - Define initial milestones

2. **Task Management**
   - Create tasks for specific milestones
   - Assign to team members
   - View tasks in DCS with proper labeling
   - Update task status

3. **Progress Visualization**
   - View project dashboard
   - See milestone progress
   - Filter tasks by various criteria
   - Move project between states (active/finished)

## Success Criteria

The PoC will be considered successful if it demonstrates:

1. Seamless integration with DCS for authentication and data management
2. Creation and management of projects with their milestones
3. Creation of tasks/issues with proper labeling and assignment
4. Visual representation of project progress
5. Implementation as a functional Theia widget

This focused PoC will demonstrate the core functionality of the system while providing a foundation for future expansion to support the full scope of the DCS Project Management System.
