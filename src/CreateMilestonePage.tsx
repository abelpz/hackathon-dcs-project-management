import React, { useEffect } from 'react';
import { useRef, useState } from 'react';
import { MultiSelect } from "react-multi-select-component";
import { createMilestone } from './core/milestone';


export default function createMilestonePage({ token }: { token: string }) {
    const milestoneNameRef = useRef<HTMLInputElement>(null);
    const milestoneOrgNameRef = useRef<HTMLInputElement>(null);
    const milestoneRepoNameRef = useRef<HTMLInputElement>(null);

  return (
        <>
            <h1>Crear Milestone</h1>
            <br />
            <label>Nombre de la milestone</label>
            <br />
            <input type="text" ref={milestoneNameRef} />
            <br />
            <label>Nombre de la organizacion</label>
            <br />
            <input type="text" ref={milestoneOrgNameRef} />
            <br />
            <label>Nombre del repositorio</label>
            <br />
            <input type="text" ref={milestoneRepoNameRef}></input>
            <br />
            <button onClick={() => {if (milestoneNameRef.current && milestoneOrgNameRef.current && milestoneRepoNameRef.current){
                createMilestone(milestoneOrgNameRef.current.value, milestoneRepoNameRef.current.value, milestoneNameRef.current.value, token)
                }
            }}>Create Milestone</button>
        </>
  )
}