import React, { useEffect, useState } from 'react';
import { SelectedProject } from './ProjectPage';
import { ProjectMilestone } from './core/projects';

export default function ProjectMilestonePage({ selectedMilestone }: { selectedMilestone: ProjectMilestone }) {

    console.log(selectedMilestone)


    return (
        <div>
            <h3>{selectedMilestone.name}</h3>
            <h1>holaaaa</h1>



        </div>
    )
}