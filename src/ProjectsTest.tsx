import React, { useState } from 'react';
import { 
  createProject, 
  getProjects, 
  deleteAllProjects,
  deleteProject,
  ProjectList, 
  ProjectSummary,
  getProject,
  addMilestoneToProject,
  closeProjectMilestone,
  getProjectMilestoneTasks,
  ProjectMilestoneTasksResult,
  ProcessedProjectData,
  ProcessedProjectMilestone,
  createProjectMilestoneTask,
  ProjectTask,
  updateProjectTaskStatus
} from './core/projects';

export default function ProjectsTest({ token }: { token: string }) {
  const [projectList, setProjectList] = useState<ProjectList | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProcessedProjectData | null>(null);
  const [selectedMilestoneTasks, setSelectedMilestoneTasks] = useState<ProjectMilestoneTasksResult | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const handleCreateProject = async () => {
    try {
      setIsLoading(true);
      const newProject = await createProject(token, {
        name: "test1",
        description: "test1",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: "active",
        resources: ["test"],  // List of resources this project will manage
        milestones: [
          {
            name: "Phase 1",
            description: "Initial phase",
            startDate: new Date().toISOString(),
            targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
            status: "open",
            resources: ["test"]  // These milestones will be created in both resources
          },
          {
            name: "Phase 2",
            description: "Second phase",
            startDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(), // Starts after Phase 1
            targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
            status: "open",
            resources: ["test"]  // This milestone will only be created in test
          }
        ]
      });

      console.log('Project created:', newProject);
      // After creating a project, fetch the updated list
      handleGetProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetProjects = async () => {
    try {
      setIsLoading(true);
      const projects = await getProjects();
      setProjectList(projects);
      console.log('Projects fetched:', projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to delete all projects? This action cannot be undone.')) {
      return;
    }

    setIsResetting(true);
    try {
      await deleteAllProjects(token);
      setProjectList(null);
      setSelectedProject(null);
      setSelectedMilestoneTasks(null);
      console.log('All projects deleted');
    } catch (error) {
      console.error('Failed to delete projects:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSelectProject = async (projectName: string) => {
    try {
      setIsLoading(true);
      const { data } = await getProject(projectName);
      const projectData = JSON.parse(atob(data.content)) as ProcessedProjectData;
      setSelectedProject(projectData);
      setSelectedMilestoneTasks(null);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!selectedProject) return;

    try {
      setIsLoading(true);
      await addMilestoneToProject(token, selectedProject.name, {
        name: `New Milestone ${Date.now()}`,
        description: "A new milestone",
        startDate: new Date().toISOString(),
        targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: "open",
        resources: selectedProject.resources
      });
      // Refresh project data
      await handleSelectProject(selectedProject.name);
    } catch (error) {
      console.error('Failed to add milestone:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseMilestone = async (milestoneId: string) => {
    if (!selectedProject) return;

    try {
      setIsLoading(true);
      await closeProjectMilestone(token, selectedProject.name, milestoneId);
      // Refresh project data
      await handleSelectProject(selectedProject.name);
    } catch (error) {
      console.error('Failed to close milestone:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetMilestoneTasks = async (milestoneId: string) => {
    if (!selectedProject) return;

    try {
      setIsLoading(true);
      setSelectedMilestoneId(milestoneId);  // Set the selected milestone ID
      const tasks = await getProjectMilestoneTasks(selectedProject.name, milestoneId, token);
      setSelectedMilestoneTasks(tasks);
    } catch (error) {
      console.error('Failed to fetch milestone tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedProject || !selectedMilestoneId || !newTaskTitle) return;

    try {
      setIsLoading(true);
      const milestone = selectedProject.milestones.find(m => m.id === selectedMilestoneId);
      if (!milestone) return;

      // Create task in the first repository associated with the milestone
      const targetRepo = milestone.dcsMapping[0]?.repoName;
      if (!targetRepo) {
        console.error('No repository available for task creation');
        return;
      }

      await createProjectMilestoneTask(
        token,
        selectedProject.name,
        selectedMilestoneId,
        targetRepo,
        {
          title: newTaskTitle,
          description: newTaskDescription,
        }
      );

      // Clear form and refresh tasks
      setNewTaskTitle('');
      setNewTaskDescription('');
      await handleGetMilestoneTasks(selectedMilestoneId);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (task: ProjectTask, newStatus: 'open' | 'closed') => {
    if (!selectedProject || !selectedMilestoneId) return;

    try {
      setIsLoading(true);
      await updateProjectTaskStatus(
        token,
        task.repository,
        task.number,
        newStatus
      );

      // Refresh tasks list
      await handleGetMilestoneTasks(selectedMilestoneId);
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {isLoading && <div style={{ color: 'blue' }}>Loading...</div>}
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleCreateProject} disabled={isLoading}>
          Create Project
        </button>
        <button 
          onClick={handleGetProjects}
          disabled={isLoading}
          style={{ marginLeft: '10px' }}
        >
          Get Projects
        </button>
        <button 
          onClick={handleReset}
          disabled={isResetting || isLoading}
          style={{ marginLeft: '10px', backgroundColor: '#ff4444', color: 'white' }}
        >
          {isResetting ? 'Resetting...' : 'Reset All'}
        </button>
      </div>

      {projectList && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Projects List</h3>
          <p>Last Updated: {new Date(projectList.lastUpdated).toLocaleString()}</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {projectList.projects.map((project: ProjectSummary) => (
              <li key={project.name} style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => handleSelectProject(project.name)}
                  style={{ 
                    padding: '5px 10px',
                    backgroundColor: selectedProject?.name === project.name ? '#4CAF50' : '#ddd',
                    color: selectedProject?.name === project.name ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  {project.name} - Status: {project.status} ({project.folder})
                </button>
                {project.name === 'test1' && (
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete the test project?')) {
                        try {
                          setIsLoading(true);
                          await deleteProject(token, project.name);
                          setProjectList(null);
                          setSelectedProject(null);
                          setSelectedMilestoneTasks(null);
                          await handleGetProjects();
                        } catch (error) {
                          console.error('Failed to delete project:', error);
                        } finally {
                          setIsLoading(false);
                        }
                      }
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete Test Project
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedProject && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Selected Project: {selectedProject.name}</h3>
          <button 
            onClick={handleAddMilestone}
            disabled={isLoading}
            style={{ marginBottom: '10px' }}
          >
            Add New Milestone
          </button>
          
          <h4>Milestones:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {selectedProject.milestones.map((milestone: ProcessedProjectMilestone) => (
              <li key={milestone.id} style={{ 
                marginBottom: '15px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>{milestone.name}</strong> - {milestone.status}
                </div>
                <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
                  {milestone.description}
                </div>
                <div style={{ fontSize: '0.8em', marginBottom: '5px' }}>
                  Start: {new Date(milestone.startDate || '').toLocaleDateString()}
                  {milestone.targetDate && ` - Target: ${new Date(milestone.targetDate).toLocaleDateString()}`}
                </div>
                <div style={{ fontSize: '0.8em', marginBottom: '10px' }}>
                  Resources: {milestone.resources && milestone.resources.length > 0 ? milestone.resources.join(', ') : 'No resources'}
                </div>
                <div>
                  <button
                    onClick={() => handleGetMilestoneTasks(milestone.id)}
                    disabled={isLoading}
                    style={{ marginRight: '10px' }}
                  >
                    View Tasks
                  </button>
                  {milestone.status === 'open' && (
                    <button
                      onClick={() => handleCloseMilestone(milestone.id)}
                      disabled={isLoading}
                      style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      Close Milestone
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedMilestoneTasks && (
        <div>
          <h4>Milestone Tasks</h4>
          
          {/* Task Creation Form */}
          <div style={{ 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <h5 style={{ marginTop: 0 }}>Create New Task</h5>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                style={{ 
                  width: '100%',
                  padding: '8px',
                  marginBottom: '8px'
                }}
              />
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Task description"
                style={{ 
                  width: '100%',
                  padding: '8px',
                  height: '100px'
                }}
              />
            </div>
            <button
              onClick={handleCreateTask}
              disabled={isLoading || !newTaskTitle}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: newTaskTitle ? 'pointer' : 'not-allowed'
              }}
            >
              Create Task
            </button>
          </div>

          {/* Task Statistics */}
          <div style={{ marginBottom: '10px' }}>
            <strong>Statistics:</strong>
            <ul>
              <li>Total Tasks: {selectedMilestoneTasks.total_count}</li>
              <li>Open Tasks: {selectedMilestoneTasks.open_count}</li>
              <li>Closed Tasks: {selectedMilestoneTasks.closed_count}</li>
            </ul>
          </div>

          {/* Task List */}
          <div>
            {selectedMilestoneTasks.tasks.map((task: ProjectTask) => (
              <div 
                key={`${task.repository}-${task.number}`} 
                style={{
                  marginBottom: '10px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: task.state === 'closed' ? '#f8f8f8' : 'white'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <h5 style={{ margin: 0 }}>{task.title}</h5>
                  <div>
                    <span style={{ 
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: task.state === 'open' ? '#4CAF50' : '#9e9e9e',
                      color: 'white',
                      marginRight: '8px'
                    }}>
                      {task.state}
                    </span>
                    {task.state === 'open' ? (
                      <button
                        onClick={() => handleUpdateTaskStatus(task, 'closed')}
                        disabled={isLoading}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Close Task
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateTaskStatus(task, 'open')}
                        disabled={isLoading}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Reopen Task
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                  Repository: {task.repository}
                </div>
                {task.description && (
                  <div style={{ 
                    fontSize: '0.9em',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                  }}>
                    {task.description}
                  </div>
                )}
                {task.assignees && task.assignees.length > 0 && (
                  <div style={{ 
                    marginTop: '8px',
                    fontSize: '0.8em',
                    color: '#666'
                  }}>
                    Assignees: {task.assignees.map(a => a.login).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
