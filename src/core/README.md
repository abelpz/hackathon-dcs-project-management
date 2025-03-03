Funciones:

- getToken(username: string, password: string): Obtiene un token de acceso a DCS.

- CheckRelationalRepoExists(repoName: string): Verifica si el repositorio relacional existe en DCS.
- CreateRelationalRepo(repoName: string, token: string): Crea el repositorio relacional en DCS, y las carpetas de los proyectos.

- ReadProjects(repoName: string, status: string): Lee los proyectos del repositorio relacional.

- CreateProject(ProjectData: ProjectData, token: string): Crea un proyecto en el repositorio relacional.
- ReadProject(ProjectId: string, token: string): Lee un proyecto del repositorio relacional.
- UpdateProject(ProjectData: ProjectData, token: string): Actualiza un proyecto del repositorio relacional.
- ArchiveProject(ProjectId: string, token: string): Mueve un proyecto al archivo.

- CreateTask(TaskData: TaskData, ParentMilestoneId: string, token: string): Crea una tarea en el repositorio indicado.
- ReadTask(TaskId: string, token: string): Lee una tarea del repositorio indicado.
- UpdateTask(TaskData: TaskData, token: string): Actualiza una tarea del repositorio indicado.
- ArchiveTask(TaskId: string, token: string): Mueve una tarea al archivo.
- FinishTask(TaskId: string, token: string): Finaliza una tarea.
- AssignTask(TaskId: string, AssigneeId: string): Asigna una tarea a un usuario.

- CreateMilestone(MilestoneData: MilestoneData, ParentProjectId: string, token: string): Crea un hito en el repositorio indicado.
- ReadMilestone(MilestoneId: string, token: string): Lee un hito del repositorio indicado.
- UpdateMilestone(MilestoneData: MilestoneData, token: string): Actualiza un hito del repositorio indicado.
- ArchiveMilestone(MilestoneId: string, token: string): Mueve un hito al archivo.
- FinishMilestone(MilestoneId: string, token: string): Finaliza un hito.

- CreateLabel(LabelData: LabelData, token: string): Crea una etiqueta en el repositorio indicado.
- CreateProjectLabel(ProjectId: string, LabelId: string, token: string): Crea una etiqueta de proyecto en el repositorio indicado.
- FilterTasksByLabel(LabelId: string, token: string): Filtra las tareas por etiqueta.

https://git.door43.org/api/swagger#/
