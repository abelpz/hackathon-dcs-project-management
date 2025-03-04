export async function createOrgRepo(repoName: string, orgName: string, token: string) {
  // Esto cambia dependiendo de la API
  const response = await fetch(`https://qa.door43.org/api/v1/orgs/${orgName}/repos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'authorization': `Bearer ${token}`
    },
    // Esto cambia dependiendo de la API
    body: JSON.stringify({
      name: repoName
    })
  })
  const data = await response.json()
  console.log({ data });
  return data
}

/* function createMilestones(milestoneBody: string, repos: string[]) { 

  repos.forEach(repo) => {
    createMilestone(repo, milestoneBody)
  }
  //Actualizar el archivo del proyecto, para añadir el milestone,
  updateMilestoneInProject(projectID, projectBody);

  return success
} */
