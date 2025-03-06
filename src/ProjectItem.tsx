import React, { useEffect, useState } from 'react';
import { SelectedProject } from './ProjectPage';


export default function ProjectItem({ selectedProject, setSelectedMilestone, projectState, setProjectState, setMilestoneIndex }: { selectedProject: SelectedProject, setSelectedMilestone: Function, projectState: string, setProjectState: Function, setMilestoneIndex: Function }) {

  /*   useEffect(() => {
      
    },[]) */


  return (
    <div>
      
      <h3>{selectedProject.name}</h3>
      <span>{selectedProject.startDate}</span>
      <br />
      <span>{selectedProject.startDate}</span>
      <br />
      <h4>{selectedProject.status}</h4>
      <br />
      <button onClick={() => {
        setProjectState("createMilestone")
      }}>Create Milestone</button>
      <br />
      <ul>{selectedProject &&
        selectedProject.milestones.map((data, i) =>
          <button onClick={() => { setProjectState("viewMilestone"); setSelectedMilestone(data); setMilestoneIndex(i) }}> <li key={i}>{`${data.name}`}</li></button>)
      }
      </ul>
      <ul>{selectedProject.resources.map((data, i) => <li key={i}>{data}</li>)}</ul>
    </div>
  )
}