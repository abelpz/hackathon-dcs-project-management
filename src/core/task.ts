
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

// - ReadTask(TaskId: string, token: string): Lee una tarea del repositorio indicado. x
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

// - UpdateTask(TaskData: TaskData, token: string): Actualiza una tarea del repositorio indicado. x
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

// - ArchiveTask(TaskId: string, token: string): Mueve una tarea al archivo. x
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

// - FinishTask(TaskId: string, token: string): Finaliza una tarea. x
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

// - AssignTask(TaskId: string, AssigneeId: string): Asignar una tarea a un usuario.const taskData() x
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