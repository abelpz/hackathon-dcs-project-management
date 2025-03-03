export async function getToken(username: string, password: string): Promise<string> { 
  const response = await fetch(`https://qa.door43.org/api/v1/users/${username}/tokens`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'authorization': `Basic ${btoa(`${username}:${password}`)}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: 'project-manager' })
  })
  const data = await response.json()
  return data.sha1
}

  