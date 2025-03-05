import React from 'react'
import { createRepoInOrg } from './core/projects'

export default function Test({ token }: { token: string }) {
  return (
    <button onClick={() => {
      createRepoInOrg("test", "es-419_lab", token).then((data) => console.log({data}))
    }}>Create Org Repo</button>
  )
}