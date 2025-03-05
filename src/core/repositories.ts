export async function getAllRepos(orgName: string) {
    // Esto cambia dependiendo de la API
    const response = await fetch(`https://qa.door43.org/api/v1/orgs/${orgName}/repos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
    })
    const data = await response.json()
 //   console.log({data});
    return data
  }