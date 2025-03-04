// - UpdateTask(TaskData: TaskData, token: string): Actualiza una tarea del repositorio indicado.

export async function updateTask(owner: string, repo: string, token: string, edit: string, indx: number) {
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
            title: edit,
        })
    })
    const data = await response.json()
    console.log({ data });
    return data
}