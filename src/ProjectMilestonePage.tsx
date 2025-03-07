import React, { useEffect, useState } from 'react';
import { SelectedProject } from './ProjectPage';
import { ProjectMilestone } from './core/projects';
import { getProjectMilestoneTasks } from './core/projects';

type MilestoneTasks = {
        total_count: number;
        open_count: number;
        closed_count: number;
        tasks: [];
        fetched_at: string;
        milestone_version: string;
        inconsistent_repos: string;
    };

    


export default function ProjectMilestonePage({ selectedMilestone, token}: { selectedMilestone: ProjectMilestone, token: string }) {

    const [ milestoneTasks, setMilestonesTasks ] = useState<MilestoneTasks>();

    

//    console.log(getProjectMilestoneTasks("test1", "milestone-1741192862647-jclm6c33w", token).then((data) => console.log(data)))

    useEffect(() => {

//            getProjectMilestoneTasks("test1", "milestone-1741192862647-jclm6c33w", token).then((data) => setMilestonesTasks(data));

        }, [])

    return (
        <div>
            <h3>{selectedMilestone.name}</h3>
            <h3>{selectedMilestone.description}</h3>
            {/* {milestoneTasks &&
                <>
                    <h3>{milestoneTasks.tasks}</h3>
                    <h3>{milestoneTasks}</h3>
                    <h3>{milestoneTasks}</h3>
                    <h3>{milestoneTasks}</h3>
                </>
            }
 */}



        </div>
    )
}