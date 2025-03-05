import React, { useState } from 'react';
import { SelectedProject } from './ProjectPage';


export default function ProjectItem({ selectedProject }: { selectedProject: SelectedProject }) {

  return (
        <div>
            <h3>{selectedProject.name}</h3>
            <span>{selectedProject.startDate}</span>
            <br />
            <span>{selectedProject.startDate}</span>
            <br />
            <h4>{selectedProject.status}</h4>
            <br />  
            <ul>{selectedProject.resources.map((data, i) => <li key={i}>{data}</li>)}</ul>
        </div>
  )
}