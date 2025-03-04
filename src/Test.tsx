import React from 'react'
import { createOrgRepo } from './core/projects'
import { assignTask } from './core/assignTask'

export default function Test({ token }: { token: string }) {
  return (
    <button onClick={() => {
      assignTask("es-419_lab", "test", token, ['GilbertoArana'], 7).then((data) => {
        console.log(data)
      })
    }}>Read Task</button>
  )
}
