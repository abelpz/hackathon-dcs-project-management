export async function createMilestone(orgName: string, repoName: string, milestoneName: string, token: string) {
  // Esto cambia dependiendo de la API
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/milestones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'authorization': `Bearer ${token}`
    },
    // Esto cambia dependiendo de la API
    body: JSON.stringify({
      "description": "esto es la milestone1",
      "due_on": "2025-03-03T20:27:31.960Z",
      "state": "open",
      "title": milestoneName
    })
  })
  const data = await response.json()
  console.log({ data });
  return data
}

export async function readAllMilestones(orgName: string, repoName: string, token: string) {
  // Esto cambia dependiendo de la API
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/milestones`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'authorization': `Bearer ${token}`
    },
  })
  const data = await response.json()
  console.log({ data });
  return data
}

export async function readMilestone(orgName: string, repoName: string, token: string, milestoneId: string) {
  // Esto cambia dependiendo de la API
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/milestones/${milestoneId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'authorization': `Bearer ${token}`
    },
  })
  const data = await response.json()
  console.log({ data });
  return data
}

export async function archiveMilestone(orgName: string, repoName: string, token: string, milestoneId: string) {
  // Esto cambia dependiendo de la API
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/milestones/${milestoneId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'authorization': `Bearer ${token}`
    },
  })
  const data = await response.json()
  console.log({ data });
  return data
}

export async function updateMilestone(orgName: string, repoName: string, token: string, milestoneId: string, newTitle: string) {
  // Esto cambia dependiendo de la API
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/milestones/${milestoneId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      "description": "esto es la milestone1",
      "due_on": "2025-03-03T20:27:31.960Z",
      "state": "open",
      "title": newTitle
    })
  })
  const data = await response.json()
  console.log({ data });
  return data
}

export async function closeMilestone(orgName: string, repoName: string, token: string, milestoneId: string) {
  // Esto cambia dependiendo de la API
  const response = await fetch(`https://qa.door43.org/api/v1/repos/${orgName}/${repoName}/milestones/${milestoneId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      "state": "closed",
    })
  })
  const data = await response.json()
  console.log({ data });
  return data
}