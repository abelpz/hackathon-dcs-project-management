// - ArchiveTask(TaskId: string, token: string): Mueve una tarea al archivo. 

export async function archiveTask(owner: string, repo: string, token: string, indx: number) {
    // Esto cambia dependiendo de la API
    const response = await fetch(`https://qa.door43.org/api/v1/repos/${owner}/${repo}/issues/${indx}`, {
        method: 'DELETE',
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