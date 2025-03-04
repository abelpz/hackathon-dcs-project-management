// - FinishTask(TaskId: string, token: string): Finaliza una tarea.

export async function finishTask(owner: string, repo: string, token: string, state: string, indx: number) {
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
            state: state
        })
    })
    const data = await response.json()
    console.log({ data });
    return data
}