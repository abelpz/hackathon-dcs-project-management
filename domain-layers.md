# Domain Layer Documentation

## Domain Flow Diagram
```mermaid
graph TB
    subgraph "Project Management Domain"
        ORG_RES[Organization Resources]
        PM[Project] -->|has access to| PROJ_RES[Project Resources]
        PM -->|has| ML[Milestones]
        ML -->|can affect| ML_RES[Milestone Resources]
        ML -->|has| TK[Tasks]
        TK -->|works on| TASK_RES[Task Resource]
        ORG_RES -->|grants access to| PROJ_RES
        PROJ_RES -->|grants access to| ML_RES
        ML_RES -->|provides| TASK_RES
        
        style PM fill:#d0f4de
        style PROJ_RES fill:#d0f4de
        style ML fill:#d0f4de
        style TK fill:#d0f4de
        style ORG_RES fill:#d0f4de
        style ML_RES fill:#d0f4de
        style TASK_RES fill:#d0f4de
    end

    subgraph "DCS Domain"
        ORG[Organization] --> RP[Repositories]
        RP --> IS[Issues]
        RP --> MS[Milestones]
        IS -->|belongs to| MS
        
        style RP fill:#f4d0d0
        style IS fill:#f4d0d0
        style MS fill:#f4d0d0
        style ORG fill:#f4d0d0
    end

    %% Mapping relationships
    ORG_RES -.->|maps to| RP
    ML_RES -.->|maps to| RP
    TK -.->|maps to| IS
    ML -.->|maps to| MS
```

## Layer Interaction Diagram
```mermaid
graph TB
    subgraph "Domain Layer Interaction"
        subgraph "Project Management Layer"
            PML[Project Manager Interface]
            style PML fill:#d0f4de
        end

        subgraph "Adapter Layer"
            ADL[DCS Adapter]
            style ADL fill:#f4e3b2
        end

        subgraph "Infrastructure Layer"
            DCS[DCS API]
            style DCS fill:#f4d0d0
        end

        PML -->|"Uses domain terms:<br/>Organization Resources<br/>Project Resources<br/>Milestone Resources<br/>Task Resource"| ADL
        ADL -->|"Translates to DCS terms:<br/>Organization Repos<br/>Project Repos<br/>Issues<br/>Milestones"| DCS
    end
```

## Example Resource Flow
```mermaid
graph TB
    subgraph "Example: Resource and Task Relationships"
        ORG_R[Organization Resources: en_ult, es_ult, fr_ult]
        PROJ[Project: Bible Translation]
        PR[Project Resources: en_ult, es_ult]
        MS1[Milestone: Phase 1]
        ML_R[Milestone Resources: en_ult]
        TK1[Task: Review Chapter 1]
        TR[Task Resource: en_ult]
        
        ORG_R -->|grants access to| PR
        PROJ -->|manages| PR
        PROJ -->|has| MS1
        PR -->|available to| ML_R
        MS1 -->|affects| ML_R
        MS1 -->|has| TK1
        ML_R -->|provides| TR
        TK1 -->|works on| TR
        
        style ORG_R fill:#d0f4de
        style PROJ fill:#d0f4de
        style PR fill:#d0f4de
        style MS1 fill:#d0f4de
        style ML_R fill:#d0f4de
        style TR fill:#d0f4de
        style TK1 fill:#d0f4de
    end
```

## Entity Relationship Diagram
```mermaid
erDiagram
    OrganizationResource ||--o{ ProjectResource : grants_access
    ProjectResource ||--o{ MilestoneResource : available_to
    MilestoneResource ||--o{ TaskResource : provides
    
    Project {
        string name PK
        string description
        string startDate
        string endDate
        string status
    }
    
    ProjectResource {
        string name PK
        string projectName FK
    }
    
    Milestone {
        string id PK
        string projectName FK
        string name
        string description
        string startDate
        string targetDate
        string status
    }
    
    MilestoneResource {
        string name PK
        string milestoneId FK
        string dcsMilestoneId FK
    }
    
    Task {
        int number PK
        string title
        string description
        string state
        string taskResourceName FK
        string milestoneId FK
        datetime createdAt
        datetime updatedAt
    }
    
    TaskResource {
        string name PK
        string milestoneResourceName FK
    }
    
    Project ||--|{ ProjectResource : manages
    Project ||--|{ Milestone : contains
    Milestone ||--|{ MilestoneResource : affects
    Milestone ||--|{ Task : has
    Task ||--|| TaskResource : works_on
```

# Domain Layer Explanation

## Project Management Domain (Business Layer)
- **Organization Resources**: The complete pool of available translatable content units at the organization level
- **Project Resources**: Resources from the organization that a project has permission to manage
- **Milestone Resources**: Resources from the project that a milestone can affect or modify
- **Task Resource**: The specific resource from the milestone's scope that a task works on
- **Project**: A translation initiative with defined scope and timeline
- **Milestones**: Project phases or deadlines
- **Tasks**: Work items that operate on a specific resource within a milestone's context

## Resource Relationships
1. **Organization Resources → Project Resources**
   - Organization maintains the complete pool of available resources
   - Projects are granted access to specific resources they can manage

2. **Project Resources → Milestone Resources**
   - Milestones can only affect resources that their project has access to
   - Each milestone defines which project resources it will modify

3. **Milestone Resources → Task Resource**
   - Tasks can only work on resources that their milestone can affect
   - Each task focuses on exactly one resource from its milestone's scope

## DCS Domain (Infrastructure Layer)
- **Organization**: Container for all repositories
- **Repository**: Storage unit for version-controlled content
- **Issues**: Tracking units for work items, linked to repositories
- **Milestones**: Grouping mechanism for issues within repositories

## Adapter Layer
The adapter layer handles these access relationships:
- Maps Organization Resources to DCS Repositories
- Maps Project Resource access to repository permissions
- Maps Milestone Resources to specific repository-milestone combinations
- Maps Tasks and their Task Resource to Issues while maintaining proper access scope

## Key Differences
1. **Resource Access Levels**
   - Project Management: Resources have cascading access control (organization → project → milestone → task)
   - DCS: Repositories have simple organization-level access

2. **Task Context**
   - Project Management: Tasks work on a single resource within their milestone's scope
   - DCS: Issues are linked to repositories and optionally to milestones

3. **Relationship Management**
   - Project Management: Hierarchical access control and scope of influence
   - DCS: Basic parent-child relationships only 