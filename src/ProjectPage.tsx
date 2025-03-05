import React, { useEffect } from 'react';
import { useState } from 'react';
import { getProject, getProjects, ProjectList } from './core/projects';
import CreateProjectPage from './CreateProjectPage';
import ProjectItem from './ProjectItem';

type ProjectState = "list" | "create" | "view";

export type SelectedProject = {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    milestones: [
        string
    ];
    resources: [
    string
  ];
}

export default function ProjectPage({ token }: { token: string }) {

    const [ projects, setProjects ] = useState<ProjectList>();
    const [ selectedProject, setSelectedProject ] = useState<SelectedProject>();
    const [ projectState, setProjectState ] = useState<ProjectState>("list"); 
    const [ projectIndex, setProjecIndex ] = useState<number>(); 

    useEffect(() => {

        getProjects().then((data) => setProjects(data));

        if ((projectIndex !== undefined) && (projects?.projects[projectIndex])) {
            console.log(projects?.projects[projectIndex]?.name);    
            getProject(projects?.projects[projectIndex]?.name).then((data) => {setSelectedProject(JSON.parse(atob(data.data.content)))});
        }
    }, [projectState]);

   // ;

  return (
        <>
            <button onClick={() => {!(projectState === "create") ? setProjectState("create") : setProjectState("list")}}>Crear Proyecto</button>
            {projectState === "list" && <ul>{projects?.projects.map((data, id) => <button onClick={() => {setProjectState("view"); setProjecIndex(id)}}><li key={id}>{`${data.name}`}</li></button>)}</ul>}
            {projectState === "create" && <CreateProjectPage token={token} />}
            {(projectState === "view" && projectIndex !== undefined && selectedProject) && <ProjectItem selectedProject={selectedProject} />}
        </>
  )
}