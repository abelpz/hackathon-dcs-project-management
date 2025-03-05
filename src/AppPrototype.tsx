import React, { useEffect } from 'react';
import { useRef, useState } from 'react';
import { createProject } from './core/projects';
import { getAllRepos } from './core/repositories';
import { MultiSelect } from "react-multi-select-component";

interface Option {
    value: any;
    label: string;
    key?: string;
    disabled?: boolean;
}

export default function AppPrototype({ token }: { token: string }) {
    const projectNameRef = useRef<HTMLInputElement>(null);
    const projectDescRef = useRef<HTMLInputElement>(null);
    const projectStartDateRef = useRef<HTMLInputElement>(null);
    const projectEndDateRef = useRef<HTMLInputElement>(null);

    const [selected, setSelected] = useState([]);

    const [ repos, setRepos ] = useState<Array<Option>>();

    useEffect(() => {

        getAllRepos("es-419_lab")
        .then((data) => data.map((repo: {description: string, name: string}) => ({ label: repo.description || repo.name, value: repo.name })))
        .then((options) => setRepos(options));

    }, []);


    
  return (
    <>
        <h1>Proyectos</h1>
        <label>Nombre project</label>
        <input type="text" ref={projectNameRef} />
        <br />
        <label>Descripción project</label>
        <input type="text" ref={projectDescRef} />
        <br />
        <label>Fecha inicio</label>
        <input type="date" ref={projectStartDateRef}></input>
        <br />
        <label>Fecha final</label>
        <input type="date" ref={projectEndDateRef}></input>
        <br />
        <div>
            <h3>Select repos</h3>
            <pre>{JSON.stringify(selected)}</pre>
            <MultiSelect
                options={repos || []}
                value={selected}
                onChange={setSelected}
                labelledBy="Select"
            />
        </div>

        <button onClick={() => {if (projectNameRef.current && projectDescRef.current && projectStartDateRef.current && projectEndDateRef.current){
              createProject(token, {
                name: projectNameRef.current.value,
                description: projectDescRef.current.value,
                startDate: projectStartDateRef.current.value,
                endDate: projectEndDateRef.current.value,
                status: "active",
                milestones: [],
                repos: [""],
            }).then((data) => console.log({data}))
            }
           }}>Create Project</button>
    </>
  )
}
