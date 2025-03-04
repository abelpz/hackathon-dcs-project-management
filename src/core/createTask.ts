
// gilberto
// - CreateTask(TaskData: TaskData, ParentMilestoneId: string, token: string): Crea una tarea en el repositorio indicado. x
// - ReadTask(TaskId: string, token: string): Lee una tarea del repositorio indicado. x
// - UpdateTask(TaskData: TaskData, token: string): Actualiza una tarea del repositorio indicado. x
// - ArchiveTask(TaskId: string, token: string): Mueve una tarea al archivo. x
// - FinishTask(TaskId: string, token: string): Finaliza una tarea. x
// - AssignTask(TaskId: string, AssigneeId: string): Asignar una tarea a un usuario.const taskData() x

// repositorio es-419_lab/test .

export async function createTask(owner: string, repo: string, token: string, title: string) {
    // Esto cambia dependiendo de la API
    const response = await fetch(`https://qa.door43.org/api/v1/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'authorization': `Bearer ${token}`
        },
        // Esto cambia dependiendo de la API
        body: JSON.stringify({
            "title": title
        })
    })
    const data = await response.json()
    console.log({ data });
    return data
}


