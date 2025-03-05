import React, { useEffect } from 'react';
import { useState } from 'react';
import { getProject, getProjects, ProjectList } from './core/projects';
import CreateProjectPage from './CreateProjectPage';
import ProjectItem from './ProjectItem';
import { ProjectMilestone } from './core/projects';
import ProjectMilestonePage from './ProjectMilestonePage';


type ProjectState = "list" | "create" | "viewProject" | "viewMilestone";

export type SelectedProject = {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    milestones: [{
        name: string;
        id: string;
    }];
    resources: [
        string
    ];
}

export default function ProjectPage({ token }: { token: string }) {

    const [projects, setProjects] = useState<ProjectList>();
    const [selectedProject, setSelectedProject] = useState<SelectedProject>();
    const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone>();
    const [projectState, setProjectState] = useState<ProjectState>("list");
    const [projectIndex, setProjectIndex] = useState<number>();
    const [projectItemId, setProjectItemId] = useState<number>(0);
    const [milestoneIndex, setMilestoneIndex] = useState<number>();

    useEffect(() => {

        getProjects().then((data) => setProjects(data));

        if ((projectIndex !== undefined) && (projects?.projects[projectIndex])) {
            getProject(projects?.projects[projectIndex]?.name).then((data) => { setSelectedProject(JSON.parse(atob(data.data.content))) });
        }
    }, [projectState]);


    return (
        <>
            <button onClick={() => { !(projectState === "create") ? setProjectState("create") : setProjectState("list") }}>Crear Proyecto</button>
            {projectState === "list" && <ul>{projects?.projects.map((data, id) => <button onClick={() => { setProjectState("viewProject"); setProjectIndex(id) }}><li key={id}>{`${data.name}`}</li></button>)}</ul>}
            {projectState === "create" && <CreateProjectPage token={token} />}
            {(projectState === "viewProject" && projectIndex !== undefined && selectedProject) && <ProjectItem selectedProject={selectedProject} setSelectedMilestone={setSelectedMilestone} projectState={projectState} setProjectState={setProjectState} setMilestoneIndex={setMilestoneIndex} />}
            {(projectState === "viewMilestone" && milestoneIndex !== undefined && selectedMilestone) && <ProjectMilestonePage selectedMilestone={selectedMilestone} />}
        </>
    )
}