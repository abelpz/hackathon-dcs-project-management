import React, { useState } from 'react'
import { createIssue } from './core/issues'
React
import { getProjectMilestoneTasks } from './core/projects'

export default function AppIssues({ token }: { token: string }) {
    const [datos, setDatos] = useState<any>(null)
    const handleClick = () => {
        getProjectMilestoneTasks('test1', 'milestone-1741192863035-wdsl7gjq6', token).then((data) => {
            setDatos(data)
            console.log(data)
        })

    }

    return (
        <>
            <div>Tareas</div>
            <button onClick={() => getProjectMilestoneTasks('test1', 'milestone-1741192863035-wdsl7gjq6', token).then((data) => {
                console.log(data)
            })}>get milestone task</button>

            <div>Tareas v2</div>
            <button onClick={handleClick}>getmilestone Task</button>
            <li>{datos?.tasks.map((task) => <li>{task.id}</li>)}</li>

        </>
    )
}