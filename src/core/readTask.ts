// repositorio es-419_lab/test .

export async function readTask(owner: string, repo: string, token: string, state: string = 'all') {
    // Esto cambia dependiendo de la API
    const response = await fetch(`https://qa.door43.org/api/v1/repos/${owner}/${repo}/issues?state=${state}&type=issues`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'authorization': `Bearer ${token}`
        },
        // Esto cambia dependiendo de la API

    })
    const data = await response.json()
    console.log({ data });
    return data
}