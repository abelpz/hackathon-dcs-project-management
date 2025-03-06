import React, { useEffect } from 'react';
import { useState } from 'react';
import { getProject, getProjects, ProjectList } from './core/projects';
import CreateProjectPage from './CreateProjectPage';
import ProjectItem from './ProjectItem';
import { ProjectMilestone } from './core/projects';
import ProjectMilestonePage from './ProjectMilestonePage';
import CreateMilestonePage from './CreateMilestonePage';
import CloseButton from './CloseButton';


export type ProjectState = "list" | "create" | "viewProject" | "viewMilestone" | "createMilestone";
//type PrevProjectState = "list" | "create" | "viewProject" | "viewMilestone" | "createMilestone";

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
};

export default function ProjectPage({ token }: { token: string }) {

    const [projects, setProjects] = useState<ProjectList>();
    const [selectedProject, setSelectedProject] = useState<SelectedProject>();
    const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone>();
    const [projectState, setProjectState] = useState<ProjectState>("list");
    const [prevProjectState, setPrevProjectState] = useState<Array<ProjectState>>([]);

    const [projectIndex, setProjectIndex] = useState<number>();
    const [projectItemId, setProjectItemId] = useState<number>(0);
    const [milestoneIndex, setMilestoneIndex] = useState<number>();


    useEffect(() => {

        getProjects().then((data) => setProjects(data));

        if ((projectIndex !== undefined) && (projects?.projects[projectIndex])) {
            getProject(projects?.projects[projectIndex]?.name).then((data) => { setSelectedProject(JSON.parse(atob(data.data.content))) });
        }
    }, [projectState]);

/*     const setCurrentState = (newState: ProjectState) => {
        if (projectState !== newState){
            setPrevProjectState(projectState); 
            (setProjectState(newState));
        }
    };
 */

    const setCurrentState = (state: ProjectState) => {

        let tempState:ProjectState = "list";

        if (prevProjectState) {
            const newState = [...prevProjectState, state]
            setPrevProjectState(newState)
            tempState = newState[newState.length -1]
        }
        if (tempState){
            setProjectState(tempState)
        }
    };

    const setPrevState = () => {
        if (prevProjectState){
        const newState = prevProjectState
        setProjectState(newState[newState.length -1])
    }
    };


    console.log(prevProjectState);

    return (
        <>
            <CloseButton setState={setPrevState}/>

            {projectState === "list" && <button onClick={() => { setCurrentState("create") }}>New Project</button>}
            
            {projectState === "list" && <ul>{projects?.projects.map((data, id) => <button onClick={() => { setCurrentState("viewProject"); setProjectIndex(id) }}><li key={id}>{`${data.name}`}</li></button>)}</ul>}

            {projectState === "create" && <CreateProjectPage token={token} />}

            {(projectState === "viewProject" && projectIndex !== undefined && selectedProject) && <ProjectItem selectedProject={selectedProject} setSelectedMilestone={setSelectedMilestone} projectState={projectState} setProjectState={setCurrentState} setMilestoneIndex={setMilestoneIndex} />}

            {(projectState === "viewMilestone" && milestoneIndex !== undefined && selectedMilestone) && <ProjectMilestonePage selectedMilestone={selectedMilestone} token={token} />}

            {projectState === "createMilestone" && <CreateMilestonePage token={token} />}
        </>
    )
}