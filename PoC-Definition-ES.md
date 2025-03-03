# Sistema de Gestión de Proyectos DCS - Definición de Prueba de Concepto

## Descripción General

Este documento define el alcance y los detalles de implementación para la Prueba de Concepto (PoC) del Sistema de Gestión de Proyectos DCS, a desarrollarse durante un hackathon de 4 días. El sistema proporcionará un enfoque estructurado para gestionar proyectos de traducción a través de la integración con el Servicio de Contenido Door43 (DCS).

## Equipos del PoC

El hackathon se organizará en cinco equipos principales, cada uno enfocado en un aspecto específico del sistema:

### Equipo de Arquitectura UI

- **Miembros**: Leonardo, Daniel, Alexandra
- **Responsabilidades**:
  - Diseñar la arquitectura general de la UI
  - Crear wireframes y maquetas
  - Asegurar la integración consistente con Theia
  - Definir patrones de interacción

### Equipo de Implementación UI

- **Miembros**: Daniel, Gabriel, Natalia, Yasnela, Yhania
- **Responsabilidades**:
  - Implementar componentes UI
  - Construir layouts responsivos

### Equipo de Lógica/API

- **Miembros**: Ilich, Elías, Abel, Gilberto
- **Responsabilidades**:
  - Implementar la lógica de negocio principal
  - Desarrollar la integración con la API de DCS
  - Manejar la gestión de datos
  - Implementar flujos de trabajo del proyecto

### Equipo de Integración React

- **Miembros**: Elías, Abel
- **Responsabilidades**:
  - Configurar el entorno de desarrollo React
  - Configurar herramientas de construcción y bundling
  - Implementar la arquitectura de componentes React
  - Configurar la gestión de estado
  - Conectar componentes UI con la lógica de negocio
  - Conectar el estado UI con datos de la API
  - Manejar el flujo de datos entre capas UI y Lógica
  - Asegurar la comunicación adecuada entre componentes

### Equipo de Extensión Theia

- **Miembros**: Abel
- **Responsabilidades**:
  - Configurar la estructura de la extensión Theia
  - Implementar la integración de widgets con React
  - Crear servicios de Gestión de Proyectos desde el Equipo de Lógica/API
  - Manejar el ciclo de vida de la extensión
  - Gestionar la integración con el workspace
  - Asegurar el empaquetado adecuado de la extensión

### Coordinación entre Equipos

- Standups diarios para seguimiento del progreso
- Documentación compartida y decisiones de diseño
- Puntos de control de integración regulares
- Sesiones colaborativas de resolución de problemas
- Revisiones de arquitectura UI con todos los equipos
- Sincronizaciones regulares de integración React-Theia

## Objetivos

1. Crear una herramienta de gestión de proyectos que se integre directamente con repositorios DCS
2. Habilitar la creación de proyectos con hitos y tareas
3. Implementar como una extensión de widget de Theia
4. Demostrar la funcionalidad principal con integración real de DCS

## Arquitectura del Sistema

### Componentes

1. **Capa UI**: Componentes React con Tailwind CSS
2. **Capa de Lógica**: Lógica de aplicación y gestión de estado
3. **Adaptador DCS**: Interfaz entre nuestra aplicación y la API de DCS
4. **Extensión Theia**: Widget para integración con el IDE Theia

### Arquitectura UI

La aplicación se implementará como una extensión de Theia con un enfoque en el impacto mínimo en el workspace y la integración perfecta con el IDE. La UI se organizará en dos áreas principales: la barra lateral y el panel principal.

#### Navegación en Barra Lateral

**Propósito**: Navegación principal y acceso rápido a todas las funciones
**Elementos Requeridos**:

1. **Sección de Proyectos**
   - Lista de proyectos con indicadores de estado
   - Agrupación de proyectos:
     - Proyectos Activos
     - Proyectos Finalizados
   - Lista de hitos del proyecto
   - Botón de Crear Proyecto

#### Pestañas del Panel Principal (Limitadas a Vistas Esenciales)

**Propósito**: Mostrar solo las vistas detalladas más críticas que necesitan visibilidad persistente

1. **Pestaña de Detalles del Proyecto**
   - Metadatos del proyecto
   - Miembros del equipo asignados
   - Enlaces a repositorios
   - Lista básica de hitos
   - Botones de acción (editar, eliminar, crear hito, etc.)

2. **Pestaña de Detalles del Hito**
   - Metadatos del hito
   - Miembros del equipo asignados
   - Lista de tareas
   - Botones de acción (editar, eliminar, etc.)
   - Botones de acción (crear tarea, etc.)

#### Información en Barra de Estado

**Propósito**: Mostrar contexto actual y acciones rápidas
**Elementos Requeridos**:

- Estado de conexión con DCS
- Proyecto actual
- Contador de tareas activas

#### Consideraciones Clave de UX

1. **Uso Mínimo de Pestañas**
   - Solo crear pestañas para vistas que necesiten visibilidad persistente
   - Mantener el workspace limpio

2. **Organización de la Barra Lateral**
   - Secciones colapsables
   - Jerarquía clara
   - Retroalimentación visual de la selección actual

3. **Preservación de Contexto**
   - Recordar últimos elementos vistos
   - Mantener estado de selección
   - Preservar configuraciones de filtro

4. **Integración con Theia**
   - Coincidir con la apariencia de Theia (los estilos se pueden personalizar con un tema personalizado a través de CSS, pero la estructura debe mantenerse)
   - Usar patrones estándar de Theia
   - Consistente con el flujo de trabajo del IDE

5. **Eficiencia**
   - Atajos de teclado para acciones comunes
   - Navegación rápida
   - Acciones en lote

### Enfoque de Almacenamiento de Datos

Almacenaremos los metadatos del proyecto en un repositorio central llamado `project-manager` con la siguiente estructura:

```
/project-manager/
  /projects/
    /active/
      project-abc.json  # Proyectos activos
      project-xyz.json
    /finished/
      project-123.json  # Proyectos completados
```

## Modelo de Datos del Proyecto

Cada proyecto se definirá en un único archivo JSON con la siguiente estructura:

```typescript
interface ProjectDefinition {
  // Metadatos principales del proyecto
  id: string;                 // Identificador único del proyecto
  name: string;               // Nombre legible del proyecto
  description: string;        // Descripción detallada del proyecto
  
  // Fechas y línea de tiempo
  createdAt: string;          // Fecha de creación en formato ISO
  startDate?: string;         // Fecha de inicio planificada opcional
  targetCompletionDate?: string; // Fecha objetivo de finalización opcional
  actualCompletionDate?: string; // Fecha real de finalización (si está completado)
  
  assignedTeam: {
    id: string;
    name: string;
  }

  // Repositorios conectados (simplificado)
  linkedRepositories: {
    repoName: string;         // Nombre del repositorio
    orgName: string;          // Nombre de la organización
  }[];
  
  // Hitos del proyecto
  milestones: {
    id: string;               // Identificador único del hito
    name: string;             // Nombre del hito
    description: string;      // Descripción detallada
    startDate?: string;       // Fecha de inicio opcional
    targetDate?: string;      // Fecha objetivo de finalización
    completedDate?: string;   // Fecha real de finalización (si está completado)
    
    // Mapeo de hito DCS
    dcsMapping?: {
      repoName: string;       // Qué repo contiene el hito
      milestoneId: number;    // ID del hito en DCS
    }[];
  }[];
}
```

## Alcance de Funcionalidades

### En Alcance

1. **Gestión de Proyectos**
   - Crear nuevos proyectos
   - Ver y editar proyectos existentes
   - Mover proyectos entre estados activo/finalizado

2. **Gestión de Hitos**
   - Crear hitos para proyectos
   - Mapear hitos a hitos de DCS
   - Seguimiento del progreso de hitos

3. **Gestión de Tareas**
   - Crear tareas como issues en repositorios DCS
   - Agregar etiquetas de proyecto (`project:{project_id}`)
   - Asignar tareas a miembros del equipo
   - Agregar tareas a hitos

4. **Integración con DCS**
   - Autenticación con DCS
   - Selección y vinculación de repositorios
   - Creación de issues con etiquetas apropiadas
   - Creación de hitos en repositorios

5. **Visualización**
   - Panel de control del proyecto con vista general del progreso
   - Visualización del estado de hitos
   - Listado de tareas con opciones de filtrado

### Fuera de Alcance

1. Seguimiento complejo de dependencias entre hitos
2. Métricas avanzadas de progreso y reportes
3. Campos personalizados y plantillas de proyecto
4. Asignación automatizada de tareas
5. Permisos basados en roles complejos
6. Análisis extensivo de proyectos

## Detalles Técnicos de Implementación

### Integración con DCS

1. **Autenticación**
   - Implementar flujo OAuth con DCS
   - Almacenar tokens de forma segura para acceso a API

2. **Gestión de Repositorios**
   - Listar repositorios disponibles en la organización
   - Crear/acceder al repositorio `project-manager`
   - Leer/escribir archivos de definición de proyecto

3. **Issues y Hitos**
   - Crear issues con etiquetas de proyecto
   - Crear hitos en repositorios vinculados
   - Seguimiento del estado de issues para progreso del proyecto

### Flujo de Gestión de Proyectos

1. **Fase de Creación**
   - Usuario crea un nuevo proyecto
   - Define metadatos básicos
   - Vincula repositorios relevantes
   - Crea hitos iniciales

2. **Gestión de Tareas**
   - Usuario crea tareas como issues en DCS
   - Cada issue se etiqueta con `project:{project_id}`
   - Issues se asignan a miembros del equipo
   - Issues se agregan a hitos relevantes

3. **Seguimiento de Progreso**
   - Sistema obtiene estado de issues desde DCS
   - Calcula finalización de hitos
   - Visualiza progreso general del proyecto

## Estructura y Cronograma del Equipo

### Día 1

**Equipo de Arquitectura UI**:

- Crear wireframes y maquetas iniciales
- Definir patrones y guías de UI/UX
- Diseñar especificaciones de componentes
- Establecer patrones de interacción

**Equipo de Implementación UI**:

- Configurar entorno de desarrollo de componentes
- Crear componentes UI base
- Implementar layouts responsivos
- Construir prototipos UI iniciales

**Equipo de Lógica/API**:

- Implementar autenticación DCS
- Diseñar estructuras de datos del proyecto
- Crear funciones de acceso a repositorios
- Definir interfaces de API

**Equipo de Integración React**:

- Configurar entorno de desarrollo React
- Configurar herramientas de construcción y bundling
- Implementar arquitectura base de React
- Configurar estructura de gestión de estado

**Equipo de Extensión Theia**:

- Configurar estructura de extensión Theia
- Crear framework básico de widgets
- Planificar puntos de integración React-Theia
- Definir servicios de extensión

### Día 2

**Equipo de Arquitectura UI**:

- Revisar y refinar patrones UI
- Definir especificaciones adicionales de componentes
- Documentar flujos de interacción
- Crear guías de prueba UI

**Equipo de Implementación UI**:

- Implementar componentes de gestión de proyectos
- Crear componentes de visualización de hitos
- Construir componentes de lista de tareas
- Desarrollar componentes de formulario

**Equipo de Lógica/API**:

- Implementar operaciones CRUD de proyectos
- Crear funciones de gestión de hitos
- Desarrollar lógica de creación de issues DCS
- Construir capa de transformación de datos

**Equipo de Integración React**:

- Conectar componentes UI con lógica de negocio
- Implementar patrones de flujo de datos
- Configurar comunicación entre componentes
- Crear hooks de gestión de estado

**Equipo de Extensión Theia**:

- Implementar integración de widgets con React
- Crear servicios de Gestión de Proyectos
- Desarrollar estructura de menú
- Configurar integración con workspace

### Día 3

**Equipo de Arquitectura UI**:

- Finalizar patrones UI
- Documentar biblioteca de componentes
- Crear guías de uso
- Revisar cumplimiento de accesibilidad

**Equipo de Implementación UI**:

- Implementar interfaz de gestión de tareas
- Crear panel de control del proyecto
- Construir componentes de filtro y búsqueda
- Agregar animaciones y transiciones

**Equipo de Lógica/API**:

- Implementar gestión de tareas/issues
- Crear lógica de cálculo de progreso
- Desarrollar transiciones de estado del proyecto
- Construir sincronización de datos

**Equipo de Integración React**:

- Optimizar comunicación entre componentes
- Implementar manejo de errores
- Agregar estados de carga
- Refinar gestión de estado

**Equipo de Extensión Theia**:

- Completar integración de widgets
- Implementar acciones de contexto
- Agregar características de workspace
- Configurar empaquetado de extensión

### Día 4

**Todos los Equipos**:

- Pruebas de integración
- Corrección de errores
- Pulido de UI
- Preparación de demo
- Finalización de documentación

## Flujo de Demo

1. **Creación de Proyecto**
   - Iniciar sesión en DCS
   - Crear nuevo proyecto con nombre y descripción
   - Vincular repositorios existentes
   - Definir hitos iniciales

2. **Gestión de Tareas**
   - Crear tareas para hitos específicos
   - Asignar a miembros del equipo
   - Ver tareas en DCS con etiquetado apropiado
   - Actualizar estado de tareas

3. **Visualización de Progreso**
   - Ver panel de control del proyecto
   - Ver progreso de hitos
   - Filtrar tareas por varios criterios
   - Mover proyecto entre estados (activo/finalizado)

## Criterios de Éxito

El PoC se considerará exitoso si demuestra:

1. Integración perfecta con DCS para autenticación y gestión de datos
2. Creación y gestión de proyectos con sus hitos
3. Creación de tareas/issues con etiquetado y asignación apropiados
4. Representación visual del progreso del proyecto
5. Implementación como un widget funcional de Theia

Este PoC enfocado demostrará la funcionalidad principal del sistema mientras proporciona una base para la expansión futura que soporte el alcance completo del Sistema de Gestión de Proyectos DCS.
