
export async function assignTask(owner: string, repo: string, token: string, user: Array<string>, indx: number) {
    // Esto cambia dependiendo de la API
    const response = await fetch(`https://qa.door43.org/api/v1/repos/${owner}/${repo}/issues/${indx}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'authorization': `Bearer ${token}`
        },
        // Esto cambia dependiendo de la API

        body: JSON.stringify({
            ...(user.length === 1 ? { assignee: user[0] } : { assignees: user })
        })
    })
    const data = await response.json()
    console.log({ data });
    return data
}