# Detalles Técnicos

Este documento describe la arquitectura técnica, los componentes y los detalles de implementación del Sistema de Gestión de Proyectos de Traducción Bíblica. Un principio central de diseño del sistema es la arquitectura de adaptadores, que crea una capa de abstracción flexible entre nuestra lógica de aplicación y los servicios backend como Door43 Content Service (DCS). Este enfoque asegura que, aunque inicialmente aprovechemos la robusta infraestructura de DCS, el sistema se mantiene lo suficientemente flexible para integrarse con otras plataformas en el futuro.

## Estructura de Repositorios

Todos los recursos del Paquete de Traducción de Libros residen en repositorios Git alojados en el Door43 Content Service (DCS) en git.door43.org. Para el Idioma de Puerta de Entrada del Español (Latinoamericano), tenemos una organización configurada como `es-419_gl` (git.door43.org/es-419_gl).

Dentro de esta organización, cada tipo de recurso tiene su propio repositorio dedicado:

- **Libros Simplificados (es-419_gl/es-419_gst)**: Contiene cada libro, un archivo por libro en formato USFM.
- **Libros Literales (es-419_gl/es-419_glt)**: Contiene cada libro, un archivo por libro en formato USFM.
- **Notas de Traducción (es-419_gl/es-419_tn)**: Contiene un archivo por libro en formato TSV, cada archivo contiene todas las notas para un libro.
- **Academia de Traducción (es-419_gl/es-419_ta)**: Contiene un manual para traducir la Biblia, con cada archivo representando un artículo. Los artículos no están específicamente relacionados con un libro de la Biblia, sino con conceptos útiles a través de múltiples pasajes. Las notas de traducción generalmente hacen referencia a artículos de la Academia de Traducción.
- **Palabras de Traducción (es-419_gl/es-419_tw)**: Contiene múltiples entradas de diccionario, una por archivo. Estas son reutilizables a través de diferentes libros y pasajes de la Biblia.
- **Preguntas de Traducción (es-419_gl/es-419_tq)**: Al igual que las notas de traducción, están en formato TSV con un archivo por libro, cada archivo contiene todas las preguntas y respuestas para un libro.

Esta estructura de repositorio facilita el desarrollo modular, el control de versiones y la colaboración, mientras mantiene una organización clara de los diferentes tipos de recursos.

## Stack Tecnológico

- **Plataforma**: Eclipse Theia
  - Plataforma extensible de código abierto para desarrollar aplicaciones tipo IDE para la nube y escritorio
  - Construida con TypeScript y la misma arquitectura que impulsa VS Code
  - Proporciona una experiencia de desarrollo web altamente personalizable

- **Frontend**: React con TypeScript
  - Utilizado dentro del framework Theia para componentes de UI personalizados

- **Arquitectura Primero-Navegador**:
  - Diseñada para ejecutarse principalmente en el navegador sin requerir un backend dedicado
  - Aprovecha las APIs de almacenamiento del navegador y llamadas API directas a DCS
  - Soporta integración backend opcional para organizaciones que lo requieran

- **Extensiones**: Distribuidas vía npm
  - Creadas como paquetes separados para funcionalidad modular
  - Compartibles con otras aplicaciones Theia
  - Sigue patrones estándar de desarrollo de extensiones Theia

- **Sistema de Plantillas**:
  - Plantillas almacenadas en DCS en el repositorio 'project-management'
  - Descargadas y aplicadas del lado del cliente
  - Personalizables por organizaciones

- **Integración API**: API DCS (git.door43.org/api/swagger)
  - Integración API RESTful con Door43 Content Service a través de la capa de adaptador

- **Autenticación**: Integración OAuth con DCS
  - Capacidades de inicio de sesión único aprovechando la autenticación de DCS
  - Extensible para soportar otros proveedores de autenticación a través de la capa de adaptador

## Arquitectura de Extensiones Theia

El Sistema de Gestión de Proyectos de Traducción Bíblica está construido como una aplicación personalizada de Eclipse Theia con un conjunto de extensiones que implementan la funcionalidad específica necesaria para la gestión de proyectos de traducción. Este enfoque ofrece varias ventajas:

### Diseño Basado en Extensiones

El sistema está estructurado como una colección de extensiones Theia:

- **Extensión Principal**: Proporciona el framework básico y las interfaces de adaptador
- **Extensión Adaptador DCS**: Implementa la funcionalidad específica del adaptador DCS
- **Extensión de Plantillas**: Gestiona plantillas de proyectos desde el repositorio 'project-management' de DCS
- **Extensión de Panel de Control**: Proporciona capacidades de visión general y seguimiento de proyectos
- **Extensión de Repositorio**: Mejora las capacidades Git existentes de Theia para necesidades específicas de traducción
- **Extensiones de Editor de Contenido**: Editores especializados para formatos USFM, TSV y Markdown

### Sistema de Plantillas

En lugar de un motor de flujo de trabajo fijo, el sistema utiliza un enfoque flexible de plantillas:

- **Plantillas alojadas en DCS**: Todas las plantillas de proyecto se almacenan en el repositorio 'project-management' dentro de la organización en DCS
- **Procesamiento del lado del cliente**: Las plantillas se descargan y procesan en el navegador
- **Estructura personalizable**: Las organizaciones pueden modificar las plantillas para que coincidan con sus procesos específicos
- **Control de versiones**: Los cambios en las plantillas se rastrean a través del control de versiones estándar de Git
- **Categorías de plantillas**:
  - Plantillas de Paquete de Traducción de Libros
  - Plantillas de hitos
  - Plantillas de tareas
  - Plantillas de verificación de calidad

### Distribución npm

Todas las extensiones están empaquetadas y distribuidas a través de npm, ofreciendo varios beneficios:

1. **Reutilización**: Otras aplicaciones basadas en Theia pueden incorporar nuestras extensiones
2. **Versionado**: Gestión clara de dependencias y rutas de actualización
3. **Modularidad**: Las organizaciones pueden elegir qué extensiones incluir
4. **Descubrimiento**: Se aplican mecanismos estándar de descubrimiento de npm
5. **Integración CI/CD**: Procesos de lanzamiento simplificados utilizando flujos de trabajo estándar de npm

### Configuración de Extensiones

Las extensiones pueden configurarse a través de mecanismos de configuración estándar de Theia:

```json
{
  "dcs-adapter": {
    "apiUrl": "https://git.door43.org/api/v1",
    "defaultOrganization": "es-419_gl"
  },
  "template-system": {
    "templateRepository": "project-management",
    "refreshInterval": 3600,
    "defaultTemplate": "book-translation-package"
  }
}
```

### Comandos Personalizados de Theia

Las extensiones proporcionan comandos personalizados de Theia que pueden activarse desde la paleta de comandos, menús o programáticamente:

- `template:apply` - Aplicar una plantilla de proyecto para crear recursos
- `template:customize` - Personalizar una plantilla existente
- `template:sync` - Sincronizar plantillas con el repositorio remoto
- `dcs:syncRepository` - Sincronizar con repositorios DCS

### Puntos de Extensión

Nuestras extensiones exponen puntos de extensión que permiten una mayor personalización:

- **Validadores de Hitos Personalizados**: Agregar reglas de validación especializadas
- **Plantillas de Informes**: Definir formatos de informes personalizados
- **Ganchos de Flujo de Trabajo**: Insertar acciones personalizadas en puntos específicos del flujo de trabajo
- **Editores Personalizados**: Agregar soporte para formatos de archivo adicionales

Esta arquitectura basada en extensiones asegura que el Sistema de Gestión de Proyectos de Traducción Bíblica pueda ser fácilmente extendido y personalizado, permitiendo que los componentes individuales sean reutilizados en otras aplicaciones basadas en Theia.

### Beneficios de Theia para la Gestión de Proyectos de Traducción Bíblica

Eclipse Theia proporciona ventajas únicas para el Sistema de Gestión de Proyectos de Traducción Bíblica:

1. **Integración Git Incorporada**: Theia incluye capacidades Git robustas de serie, que podemos extender para necesidades específicas de DCS sin construir el control de versiones desde cero

2. **Experiencia Tipo IDE**: Los traductores y revisores se benefician de las características de IDE como resaltado de sintaxis, validación y edición de texto enriquecido para varios formatos (USFM, Markdown, etc.)

3. **Despliegue en Escritorio y Nube**: Las aplicaciones Theia pueden ejecutarse como aplicaciones de escritorio o servicios alojados en la nube, permitiendo trabajo de traducción tanto en línea como fuera de línea

4. **Acceso al Sistema de Archivos**: La integración directa con sistemas de archivos locales y remotos simplifica el trabajo con repositorios de recursos de traducción

5. **Ecosistema de Extensiones**: Podemos aprovechar extensiones existentes de Theia/VS Code para funcionalidades adicionales:
   - Extensiones de vista previa de Markdown para documentación
   - Visores de diferencias para comparar traducciones
   - Extensiones de colaboración para edición en tiempo real

6. **Soporte de Idiomas**: El soporte incorporado para internacionalización facilita la creación de una interfaz de usuario completamente traducida para traductores de diferentes orígenes lingüísticos

7. **Diseño Personalizable**: El sistema de diseño flexible de Theia nos permite crear bancos de trabajo especializados para diferentes fases del proceso de traducción:
   - Banco de trabajo de redacción con texto fuente y editor de destino
   - Banco de trabajo de revisión con vistas de comparación
   - Banco de trabajo de alineación con herramientas de alineación especializadas

8. **Tecnologías Web**: Estar construido sobre tecnologías web facilita la integración con servicios basados en web como DCS y soporta flujos de trabajo basados en navegador

9. **Código Abierto**: La naturaleza de código abierto de Theia se alinea con el enfoque colaborativo, impulsado por la comunidad, de los proyectos de traducción bíblica

Estas ventajas hacen de Theia una plataforma ideal para construir herramientas especializadas para los complejos flujos de trabajo involucrados en la gestión de proyectos de traducción bíblica.

## Integración con Door43 Content Service (DCS)

Nuestro sistema se integra con la API de Door43 Content Service a través de nuestra arquitectura de adaptadores para gestionar contenido bíblico y flujos de trabajo de proyectos. Este enfoque nos permite aprovechar la robusta infraestructura de DCS mientras mantenemos flexibilidad para futuros cambios de backend.

### Gestión de Repositorios

- Creación y gestión de repositorios git para cada proyecto de traducción
- Gestión de ramas y etiquetas para control de versiones
- Gestión de permisos para colaboradores
- Seguimiento del estado y metadatos del repositorio a través de nuestra capa de adaptador

### Acceso y Modificación de Contenido

- Lectura y escritura de contenido en repositorios
- Manejo de diferentes formatos de archivo incluyendo Markdown, USFM y otros formatos de texto bíblico
- Gestión de estructura y organización de contenido
- Abstracción de operaciones de archivos a través de nuestras interfaces específicas de dominio

### Características de Gestión de Proyectos

- **Issues**: Aprovechamiento del sistema de seguimiento de issues de DCS para gestionar tareas de traducción
- **Hitos**: Mapeo de nuestro proceso de 8 hitos a objetos de hitos de DCS
- **Pull Requests**: Uso de flujos de trabajo de PR para procesos de revisión
- **Revisiones**: Implementación de revisiones formales a través del mecanismo de revisión de DCS
- **Equipos**: Integración con estructuras de equipo de DCS para acceso basado en roles

### Autenticación de Usuario

- Autenticación basada en OAuth con DCS
- Gestión de roles y permisos de usuario
- Integración de equipos y organizaciones
- Gestión de identidad basada en adaptadores para posible soporte de múltiples sistemas

### Operaciones de Control de Versiones

- Seguimiento del historial de confirmaciones
- Generación y visualización de diferencias
- Manejo de solicitudes de fusión
- Soporte para resolución de conflictos

### Implementación del Adaptador

Nuestras implementaciones de adaptadores DCS mapearán estos conceptos específicos de DCS al modelo de dominio de nuestra aplicación. Por ejemplo:

- Una tarea de Paquete de Traducción de Libros podría convertirse en un issue de DCS con etiquetas y metadatos específicos
- Los hitos de traducción se mapean a objetos de hito DCS con propiedades personalizadas
- Las interdependencias de componentes se rastrean a través de relaciones y etiquetas de issues

Este enfoque proporciona los beneficios de la robusta infraestructura de DCS mientras mantiene la flexibilidad para potencialmente integrarse con otros sistemas en el futuro.

## Arquitectura del Sistema

El sistema sigue una arquitectura modular con los siguientes componentes:

1. **Módulo de Autenticación**
   - Maneja la autenticación de usuarios y gestión de sesiones
   - Se integra con OAuth de DCS
   - Se ejecuta completamente en el navegador usando el flujo implícito OAuth

2. **Módulo de Gestión de Proyectos**
   - Gestiona proyectos, tareas y asignaciones
   - Realiza seguimiento del progreso a través de hitos
   - Proporciona capacidades de panel de control e informes
   - Utiliza almacenamiento del navegador para capacidades sin conexión

3. **Módulo de Gestión de Plantillas**
   - Descarga y aplica plantillas desde el repositorio 'project-management' de DCS
   - Procesa definiciones de plantillas del lado del cliente
   - Permite personalización y guardado de plantillas
   - Implementa el proceso de 8 hitos como plantillas configurables

4. **Módulo de Gestión de Contenido**
   - Interactúa directamente con la API de DCS para operaciones de repositorio
   - Gestiona el versionado y sincronización de contenido
   - Proporciona interfaces de edición y revisión de contenido
   - Implementa almacenamiento en caché sin conexión con sincronización

5. **Módulo de Colaboración**
   - Maneja comentarios, notificaciones y comunicaciones
   - Proporciona sondeo para actualizaciones en actividades del proyecto
   - Facilita interacciones entre miembros del equipo a través de DCS

### Implementación Primero-Navegador

El sistema está diseñado para ejecutarse principalmente en el navegador:

1. **Integración Directa con API DCS**
   - El navegador realiza llamadas autenticadas directamente a la API de DCS
   - Utiliza tokens OAuth almacenados de forma segura en el almacenamiento del navegador

2. **Local Storage & IndexedDB**
   - Almacena en caché repositorios, plantillas y datos de usuario
   - Permite trabajo sin conexión sin un backend
   - Implementa lógica de sincronización para reconciliar cambios

3. **Integración Backend Opcional**
   - Define interfaces estándar para comunicación con backend
   - Permite a las organizaciones implementar backends personalizados
   - Soporta autenticación proxy para seguridad mejorada

4. **Aplicación Web Progresiva**
   - Service workers para capacidades sin conexión
   - Sincronización en segundo plano para cambios hechos sin conexión
   - Notificaciones locales para eventos importantes

Esta arquitectura primero-navegador asegura que la aplicación pueda ejecutarse sin infraestructura de servidor compleja mientras proporciona funcionalidad rica a través de la API DCS y procesamiento del lado del cliente.

## Arquitectura de Capa de Adaptador

El Sistema de Gestión de Proyectos de Traducción Bíblica implementa el patrón de adaptador para crear una capa de abstracción flexible entre nuestra aplicación y sistemas backend como Door43 Content Service (DCS). Esta arquitectura permite extensibilidad futura y portabilidad del sistema.

### Visión General del Patrón de Adaptador

```
Capa de Aplicación
      ↑
      |
Capa de Interfaz de Adaptador
      ↑
   /  |  \
Adaptador  Adaptadores
DCS   |   Futuros
```

Este patrón proporciona varios beneficios clave:

- **Desacoplamiento**: La lógica de aplicación permanece independiente de cualquier implementación de backend específica
- **Extensibilidad**: El soporte para nuevos backends requiere solo implementar las interfaces de adaptador
- **Testabilidad**: Fácil de crear implementaciones simuladas para pruebas
- **Flexibilidad**: Las organizaciones pueden integrarse con sus herramientas de gestión de proyectos preferidas

### Interfaces de Adaptador Principales

El sistema define interfaces claras para cada capacidad de gestión de proyectos:

```typescript
// Interfaces principales
interface IRepositoryService {
  getRepository(org: string, repo: string): Promise<Repository>;
  listRepositories(org: string): Promise<Repository[]>;
  createPullRequest(repo: Repository, title: string, description: string, ...): Promise<PullRequest>;
  // Otras operaciones de repositorio
}

interface IIssueService {
  createIssue(repo: Repository, title: string, description: string, ...): Promise<Issue>;
  assignIssue(issue: Issue, assignee: User): Promise<void>;
  getIssuesByMilestone(milestone: Milestone): Promise<Issue[]>;
  // Otras operaciones de issues
}

interface IMilestoneService {
  createMilestone(repo: Repository, title: string, description: string, ...): Promise<Milestone>;
  updateMilestoneProgress(milestone: Milestone, progress: number): Promise<void>;
  // Otras operaciones de hitos
}

// Interfaces adicionales para revisiones, equipos, etc.
```

### Implementación DCS

La implementación inicial trabajará con Door43 Content Service:

```typescript
class DCSRepositoryService implements IRepositoryService {
  constructor(private dcsClient: DCSApiClient) {}
  
  async getRepository(org: string, repo: string): Promise<Repository> {
    // Llamar a la API DCS para obtener datos del repositorio
    const dcsRepo = await this.dcsClient.repos.get(org, repo);
    // Mapear respuesta DCS a tu modelo de dominio
    return mapDCSRepositoryToRepository(dcsRepo);
  }
  
  // Implementar otros métodos...
}

// Implementaciones similares para otros servicios
```

### Adaptadores Específicos de Dominio

El sistema también implementa adaptadores de nivel superior para conceptos específicos de Paquetes de Traducción de Libros:

```typescript
interface ITranslationPackageService {
  createBookTranslationPackage(language: string, book: BiblicalBook): Promise<TranslationPackage>;
  advanceToNextMilestone(package: TranslationPackage): Promise<void>;
  getComponentProgress(package: TranslationPackage, component: PackageComponent): Promise<number>;
  // Otras operaciones específicas de dominio
}

// Implementado componiendo los servicios de nivel inferior
class DCSTranslationPackageService implements ITranslationPackageService {
  constructor(
    private repoService: IRepositoryService,
    private issueService: IIssueService,
    private milestoneService: IMilestoneService
  ) {}
  
  // La implementación mapea conceptos de dominio a los repositorios,
  // issues, hitos, etc. apropiados en DCS
}
```

### Gestión de Configuración

Para soportar múltiples configuraciones de backend, el sistema utiliza un patrón de fábrica:

```typescript
// Fábrica para crear la implementación correcta
class ProjectManagementServiceFactory {
  static createServices(config: AppConfig): {
    repositoryService: IRepositoryService,
    issueService: IIssueService,
    // etc.
  } {
    if (config.backend === 'dcs') {
      const dcsClient = new DCSApiClient(config.dcsApiUrl, config.authToken);
      return {
        repositoryService: new DCSRepositoryService(dcsClient),
        issueService: new DCSIssueService(dcsClient),
        // etc.
      };
    } else if (config.backend === 'github') {
      // Crear implementaciones GitHub
    } else {
      // Manejar otros backends
    }
  }
}
```

### Modelo de Datos de Configuración

El sistema define un modelo de configuración claro para especificar preferencias de backend:

```typescript
interface BackendConfig {
  type: 'dcs' | 'github' | 'gitlab' | 'custom';
  apiUrl: string;
  authMethod: 'oauth' | 'token' | 'basic';
  // Otra configuración común
  
  // Secciones de configuración específicas de backend
  dcsSpecific?: {
    // Configuraciones específicas de DCS
  };
  githubSpecific?: {
    // Configuraciones específicas de GitHub
  };
  // etc.
}
```

### Beneficios del Enfoque de Adaptador

1. **Código Portable**: El núcleo de la aplicación no está ligado a características específicas de DCS
2. **Migración Simplificada**: Moverse a otro backend requiere implementar nuevos adaptadores, no reescribir la lógica de la aplicación
3. **Soporte para Múltiples Backends**: Las organizaciones pueden conectarse a sus herramientas de gestión de proyectos preferidas
4. **Preparación para el Futuro**: A medida que las herramientas de gestión de proyectos evolucionan, solo necesitan actualizarse las implementaciones de adaptadores
5. **Modelo de Dominio Consistente**: La lógica de la aplicación trabaja con conceptos específicos de traducción independientemente del backend

## Opciones de Backend Alternativas

La arquitectura de adaptadores permite que el Sistema de Gestión de Proyectos de Traducción Bíblica potencialmente soporte múltiples sistemas backend. Mientras que la implementación inicial se integrará con Door43 Content Service (DCS), el diseño permite la expansión futura a otras plataformas:

### Integración con GitHub

GitHub proporciona características de gestión de proyectos similares que podrían ser soportadas a través de nuestra capa de adaptador:

- **GitHub Issues** podría gestionar tareas de traducción
- **GitHub Projects** podría organizar el flujo de trabajo de 8 hitos
- **GitHub Actions** podría automatizar pasos de validación y publicación
- **GitHub Teams** podría gestionar roles de colaboradores

### Integración con GitLab

GitLab ofrece herramientas integrales de gestión de proyectos que podrían aprovecharse:

- **GitLab Issues** para seguimiento de tareas
- **GitLab Epics** para organizar grupos de hitos
- **GitLab CI/CD** para flujos de trabajo de validación automatizados
- **GitLab Boards** para visualizar el progreso de traducción

### Sistemas Personalizados de Gestión de Proyectos

Organizaciones con sistemas existentes de gestión de proyectos podrían desarrollar adaptadores personalizados:

- Integración con **Jira** para organizaciones que usan herramientas Atlassian
- **Azure DevOps** para organizaciones centradas en Microsoft
- **Trello** para equipos con necesidades de flujo de trabajo más simples
- **Sistemas internos personalizados** a través de implementaciones de adaptadores

### Modo Independiente

Versiones futuras podrían potencialmente incluir un modo independiente con gestión de proyectos incorporada:

- **Base de datos integrada** para almacenar datos de proyectos
- **Motor de flujo de trabajo nativo** implementando el proceso de 8 hitos
- **Sincronización opcional** con sistemas externos
- **Despliegue autónomo** para entornos sin conexión o restringidos

Esta flexibilidad asegura que el Sistema de Gestión de Proyectos de Traducción Bíblica pueda adaptarse a varias necesidades organizacionales y entornos tecnológicos mientras mantiene una experiencia de usuario y modelo de dominio consistentes.

## Modelo de Datos

El sistema gestiona las siguientes entidades clave, almacenadas principalmente en el almacenamiento del navegador con sincronización a DCS:

- **Proyectos**: Proyectos de Paquete de Traducción de Libros derivados de plantillas
- **Plantillas**: Almacenadas en el repositorio 'project-management' de DCS, definiendo:
  - Estructura de hitos y dependencias
  - Plantillas de tareas y asignaciones
  - Criterios de verificación de calidad
  - Configuración de repositorio
- **Hitos**: Los 8 hitos primarios y sus subcomponentes según se definen en las plantillas
- **Tareas**: Elementos de trabajo individuales asignados a miembros del equipo
- **Recursos**: Artefactos de traducción (GLT, GST, TN, TW, TA, TQ)
- **Usuarios**: Usuarios del sistema con roles y permisos
- **Equipos**: Grupos de usuarios trabajando en proyectos específicos
- **Comentarios**: Retroalimentación y discusiones sobre contenido

### Almacenamiento del Lado del Cliente

La arquitectura primero-navegador utiliza varios mecanismos de almacenamiento:

- **Local Storage**: 
  - Preferencias de usuario
  - Tokens de autenticación
  - Proyectos accedidos recientemente
  
- **IndexedDB**:
  - Contenido de repositorio en caché
  - Datos de plantillas
  - Trabajo en progreso
  - Cambios pendientes
  
- **Integración DCS**:
  - Almacenamiento de datos primario a través de repositorios
  - Issues para tareas
  - Hitos para fases del proyecto
  - Comentarios para colaboración

Este enfoque híbrido permite trabajo sin conexión mientras asegura que todos los datos críticos sean eventualmente sincronizados a DCS para persistencia y colaboración.

## Gestión de Proyectos Cross-Repository

El Sistema de Gestión de Proyectos de Traducción Bíblica utiliza un enfoque centralizado para gestionar proyectos que abarcan múltiples repositorios dentro de una organización DCS. Esto se implementa a través de un repositorio especial llamado `project-manager` dentro de cada organización.

### Comprendiendo las Restricciones de la API de DCS

Después de analizar la [API de DCS](https://git.door43.org/api/swagger), hemos identificado varias características clave que dan forma a nuestro enfoque de gestión de proyectos:

1. **Issues y Hitos Específicos de Repositorio**: La API de DCS gestiona issues y hitos a nivel de repositorio, sin un concepto de proyecto cross-repository incorporado
2. **Organización Basada en Etiquetas**: Las etiquetas proporcionan una forma flexible de categorizar y filtrar issues a través de repositorios
3. **Consulta Cross-Repository Limitada**: No hay una única llamada API para recuperar issues de múltiples repositorios simultáneamente
4. **Sin Seguimiento Nativo de Dependencias**: DCS no tiene un mecanismo incorporado para rastrear dependencias entre issues en diferentes repositorios

Estas restricciones hacen necesario nuestro enfoque centralizado de definición YAML para proporcionar capacidades de gestión de proyectos cross-repository.

### Estructura de Definición de Proyecto

El repositorio `project-manager` contiene definiciones YAML estructuradas para proyectos que coordinan trabajo a través de múltiples repositorios:

```yaml
# projects/genesis-btp.yaml
id: genesis-btp-2023
name: "Paquete de Traducción del Libro de Génesis"
description: "Crear todos los componentes del Paquete de Traducción del Libro de Génesis"
type: book-translation-package
book: GEN
language: es-419

# Estos repositorios estarán involucrados en este proyecto
repositories:
  - repo: es-419_gl/es-419_glt
    role: "Traducción Literal"
  - repo: es-419_gl/es-419_gst
    role: "Traducción Simplificada"
  - repo: es-419_gl/es-419_tn
    role: "Notas de Traducción"
  - repo: es-419_gl/es-419_ta
    role: "Academia de Traducción"
  - repo: es-419_gl/es-419_tw
    role: "Palabras de Traducción"
  - repo: es-419_gl/es-419_tq
    role: "Preguntas de Traducción"

# Definiciones de hitos con alcance de repositorio
milestones:
  - id: milestone-1-drafting
    name: "Hito 1: Fase de Redacción"
    description: "Redacción inicial de traducciones literales y simplificadas"
    due_date: "2023-10-01"
    # Solo crear este hito en estos repositorios
    repositories: 
      - es-419_gl/es-419_glt
      - es-419_gl/es-419_gst
    
  - id: milestone-2-review
    name: "Hito 2: Fase de Revisión Inicial" 
    description: "Revisiones por pares y por equipo de las traducciones redactadas"
    due_date: "2023-11-01"
    repositories: 
      - es-419_gl/es-419_glt
      - es-419_gl/es-419_gst
    
  - id: milestone-5-supporting
    name: "Hito 5: Traducción de Recursos de Apoyo"
    description: "Creación de recursos de apoyo"
    due_date: "2023-12-15"
    repositories:
      - es-419_gl/es-419_tn
      - es-419_gl/es-419_ta
      - es-419_gl/es-419_tw
      - es-419_gl/es-419_tq
  
  # Hitos adicionales...

# Definir tipos de tareas comunes que pueden usarse en todos los repositorios y hitos
task_types:
  - id: draft
    name: "Tarea de Redacción"
    description: "Redacción inicial de contenido"
    labels: ["drafting"]
    estimate_hours: 40
    
  - id: peer-review
    name: "Tarea de Revisión por Pares"
    description: "Revisión por traductor par"
    labels: ["review", "peer"]
    estimate_hours: 20
    
  # Tipos de tareas adicionales...

# Definir dependencias lógicas entre tareas (a ser aplicadas por la app)
dependencies:
  - from:
      repository: es-419_gl/es-419_glt
      milestone: milestone-1-drafting
      task_type: draft
    to:
      repository: es-419_gl/es-419_glt
      milestone: milestone-2-review
      task_type: peer-review
      
  # Dependencias cross-repository
  - from:
      repository: es-419_gl/es-419_glt
      milestone: milestone-2-review
    to:
      repository: es-419_gl/es-419_tn
      milestone: milestone-5-supporting
      
  # Más dependencias...

# Etiquetas a nivel de proyecto para ser usadas consistentemente en todos los repositorios
labels:
  - name: "project:genesis-btp"
    color: "#ff0000"
    description: "Paquete de Traducción del Libro de Génesis"
  - name: "milestone:1-drafting"
    color: "#00ff00"
    description: "Hito 1: Fase de Redacción"
  - name: "milestone:2-review"
    color: "#0000ff" 
    description: "Hito 2: Fase de Revisión Inicial"
  # Etiquetas adicionales...
```

Observe que los hitos ahora están limitados a repositorios específicos. Por ejemplo, el "Hito 1: Fase de Redacción" solo se aplica a los repositorios de traducción literal y simplificada, mientras que el "Hito 5: Traducción de Recursos de Apoyo" se aplica a los repositorios de recursos de apoyo. Esto asegura que cada repositorio solo contenga hitos que sean relevantes para su función específica en el proyecto.

### Sistema de Plantillas de Proyecto

El repositorio `project-manager` también contiene definiciones de plantillas que pueden usarse para crear nuevos proyectos:

```yaml
# templates/book-translation-package.yaml
id: btp-template
name: "Plantilla de Paquete de Traducción de Libro"
type: template
description: "Plantilla para crear proyectos de Paquete de Traducción de Libro"
parameters:
  - name: BOOK_CODE
    description: "Código de libro de tres letras (e.g., GEN, EXO, LEV)"
    required: true
  - name: LANGUAGE_CODE
    description: "Código de idioma (e.g., es-419)"
    required: true
  - name: START_DATE
    description: "Fecha de inicio del proyecto"
    required: true
  - name: TARGET_DATE
    description: "Fecha objetivo de finalización"
    required: true

# Definir tipos de tareas comunes reutilizables
task_types:
  - id: translate
    name: "Tarea de Traducción"
    description: "Plantilla genérica de tarea de traducción"
    labels: ["translation"]
    estimate_hours: 40
    
  - id: review
    name: "Tarea de Revisión"
    description: "Plantilla genérica de tarea de revisión"
    labels: ["review"]
    estimate_hours: 20
    
  - id: technical-check
    name: "Verificación Técnica"
    description: "Plantilla de tarea de validación técnica"
    labels: ["technical", "validation"]
    estimate_hours: 15
    
  # Tipos de tareas comunes adicionales...

repositories:
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
    role: "Traducción Literal"
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_gst
    role: "Traducción Simplificada"
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_tn
    role: "Notas de Traducción"
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_ta
    role: "Academia de Traducción"
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_tw
    role: "Palabras de Traducción"
  - repo: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_tq
    role: "Preguntas de Traducción"

# La plantilla define la estructura estándar de 8 hitos con alcance de repositorio
# y configuraciones de tipo de tarea específicas de hito
milestones:
  - id: milestone-1-drafting
    name: "Hito 1: Fase de Redacción"
    description: "Redacción inicial de traducciones literales y simplificadas"
    due_date_offset: "30" # días desde la fecha de inicio
    repositories: 
      - ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
      - ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_gst
    
    # Tipos de tareas específicas de hito con configuración de auto-generación
    milestone_tasks:
      - type_ref: translate
        name_override: "Redactar Traducción Literal"
        repository: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
        labels_add: ["type:glt-draft", "milestone:1-drafting"]
        auto_generate: true
        assignment_strategy: "role_based" # Asignar basado en roles de equipo
        
      - type_ref: translate
        name_override: "Redactar Traducción Simplificada"
        repository: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_gst
        labels_add: ["type:gst-draft", "milestone:1-drafting"]
        auto_generate: true
        assignment_strategy: "role_based"

  - id: milestone-2-review
    name: "Hito 2: Fase de Revisión Inicial"
    description: "Revisiones por pares y por equipo de las traducciones redactadas"
    due_date_offset: "60"
    repositories: 
      - ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
      - ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_gst
    
    milestone_tasks:
      - type_ref: review
        name_override: "Verificación por Pares de Traducción Literal"
        repository: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
        labels_add: ["type:glt-peer-review", "milestone:2-review"]
        auto_generate: true
        depends_on: "milestone-1-drafting.Redactar Traducción Literal"
        assignment_strategy: "different_than_predecessor" # Asignar a alguien diferente al redactor
        
      - type_ref: review
        name_override: "Verificación por Equipo de Traducción Literal"
        repository: ${LANGUAGE_CODE}_gl/${LANGUAGE_CODE}_glt
        labels_add: ["type:glt-team-review", "milestone:2-review"]
        auto_generate: true
        depends_on: "milestone-2-review.Verificación por Pares de Traducción Literal"
        assignment_strategy: "team_lead"
        
      # Más tareas específicas de hito...
  
  # Hitos adicionales con sus configuraciones específicas de tarea...
```

Este enfoque híbrido ofrece varias ventajas para la gestión de proyectos:

1. **Definiciones de Tipo de Tarea Reutilizables**: Los tipos de tarea principales se definen una vez a nivel de proyecto
2. **Personalización Específica de Hito**: Cada hito puede personalizar tipos de tarea para sus necesidades específicas
3. **Generación Automática de Tareas**: La bandera `auto_generate` permite al sistema crear tareas automáticamente cuando se configura un proyecto
4. **Dependencias Claras**: Las dependencias de tareas pueden especificarse tanto a nivel de proyecto como dentro de definiciones de tarea específicas de hito
5. **Estrategia de Asignación Flexibles**: Se pueden especificar diferentes estrategias para asignar tareas para cada tipo de tarea en un hito
6. **Etiquetado Semántico**: Los patrones de nomenclatura estructurados para etiquetas permiten filtrado avanzado y automatización

### Estrategia de Etiquetado Semántico

El sistema implementa una estrategia de etiquetado semántico con prefijos claros que denotan el propósito de la etiqueta:

- `project:nombre` - Identifica a qué proyecto pertenece un issue (e.g., `project:genesis-btp`)
- `milestone:id` - Identifica a qué hito pertenece un issue (e.g., `milestone:1-drafting`)
- `type:recurso-tarea` - Identifica el tipo específico de tarea (e.g., `type:glt-draft`, `type:tn-creation`)
- `role:nombre` - Identifica qué rol debería trabajar en esta tarea (e.g., `role:translator`, `role:reviewer`)
- `status:estado` - Para información de estado adicional más allá de abierto/cerrado (e.g., `status:blocked`, `status:needs-review`)
- `priority:nivel` - Indica la prioridad de la tarea (e.g., `priority:high`, `priority:medium`)

Este enfoque ofrece varias ventajas:

1. **Formato Legible por Máquina**: La aplicación puede analizar y categorizar fácilmente las etiquetas
2. **Filtrado Potente**: Los usuarios pueden filtrar por prefijo de etiqueta (e.g., mostrar todas las tareas `type:glt-*`)
3. **Organización Visual**: Las etiquetas se agrupan naturalmente en la UI cuando se ordenan alfabéticamente
4. **Procesamiento Automatizado**: La aplicación puede crear y asignar dinámicamente etiquetas usando patrones consistentes
5. **Nomenclatura Consistente**: Aplica convenciones para etiquetado en todo el equipo
6. **Optimización de Consultas**: Permite consultas API más eficientes usando combinaciones de etiquetas

La aplicación generará y aplicará automáticamente estas etiquetas semánticas al crear issues a partir de plantillas, asegurando consistencia a través de repositorios y haciendo la gestión de proyectos más eficiente.

### Beneficios Clave del Enfoque Cross-Repository

1. **Vista Unificada del Proyecto**: Proporciona una única definición que abarca todos los repositorios involucrados en un Paquete de Traducción de Libro
2. **Hitos Apropiados por Repositorio**: Cada repositorio contiene solo los hitos que son relevantes para su rol
3. **Seguimiento de Dependencias**: Dependencias explícitas entre tareas e hitos a través de repositorios
4. **Monitoreo de Progreso**: Seguimiento centralizado del estado del proyecto a través de múltiples repositorios
5. **Coordinación de Equipo**: Roles y responsabilidades claramente definidos a través de repositorios
6. **Configuración Automatizada**: Las plantillas de proyecto pueden aplicarse para configurar rápidamente nuevos proyectos de libros
7. **Eficiencia**: Sin hitos innecesarios abarrotando repositorios donde no aplican
8. **Etiquetado Semántico**: Patrones de nomenclatura estructurados para etiquetas habilitan filtrado avanzado y automatización

### Implementación en la Aplicación Theia

Dentro de nuestra aplicación basada en Theia, el contenido del repositorio `project-manager` es:

1. **Descargado y analizado** al inicio de la aplicación o bajo demanda
2. **Analizado para determinar repositorios y hitos relevantes**
3. **Usado para configurar o sincronizar issues, hitos y etiquetas DCS**
4. **Referenciado para validación de dependencias y cumplimiento de flujo de trabajo**
5. **Consultado para informes unificados de proyectos y visualización**

Este enfoque permite a los equipos gestionar proyectos complejos y multi-repositorio como Paquetes de Traducción de Libro con una interfaz unificada mientras mantiene la estructura modular de repositorio que facilita el trabajo paralelo y la clara separación de responsabilidades.

## Integración con Wiki de DCS para Informes

El Sistema de Gestión de Proyectos de Traducción Bíblica aprovecha la API de wiki de DCS para generar y almacenar informes de proyecto, proporcionando una clara separación entre los datos de configuración del proyecto y los informes generados a partir de esos datos.

### Estrategia de Informes Basada en Wiki

En lugar de confirmar informes en el repositorio principal, el sistema utiliza la wiki asociada con el repositorio `project-manager` como un espacio dedicado para documentación e informes del proyecto:

1. **Historial Git Limpio**: Mantiene el historial del repositorio principal enfocado en cambios significativos de plantilla y configuración
2. **Separación de Responsabilidades**: 
   - Repositorio principal: Definiciones de proyecto, plantillas, configuraciones
   - Wiki: Informes generados, actualizaciones de estado, documentación del proyecto
3. **Mejor Experiencia de Colaboración**: Los miembros del equipo pueden encontrar informes en un espacio dedicado
4. **Soporte Markdown**: Las wikis de DCS soportan Markdown para informes bien formateados con tablas y diagramas
5. **Documentación Versionada**: Los cambios de wiki siguen estando controlados por versiones, pero separados del repositorio principal

### Tipos de Informes Wiki

El sistema puede generar varios tipos de informes en la wiki:

1. **Informes de Visión General del Proyecto**:
   ```
   estado-proyecto-{project-id}
   ```
   - Resumen de todos los repositorios involucrados
   - Progreso a través de todos los hitos
   - Visión general de asignación de equipo
   - Visualización de línea de tiempo

2. **Informes de Hitos**:
   ```
   informe-hito-{project-id}-{milestone-id}
   ```
   - Estado detallado de un hito específico
   - Tareas completadas/pendientes
   - Problemas o bloqueos
   - Métricas de calidad

3. **Informes Específicos de Repositorio**:
   ```
   informe-repositorio-{project-id}-{repo-name}
   ```
   - Enfoque en las contribuciones de un solo repositorio al proyecto
   - Estado de finalización de recursos

4. **Informes de Equipo**:
   ```
   informe-equipo-{project-id}
   ```
   - Asignaciones de miembros y carga de trabajo
   - Métricas de productividad
   - Patrones de colaboración

### Implementación de API Wiki

La aplicación utiliza los endpoints wiki de la API de DCS para generar y actualizar informes programáticamente:

```typescript
async function generarYSubirInformeProyecto(
  propietario: string, 
  repo: string, 
  proyectoId: string
): Promise<void> {
  // 1. Generar contenido del informe en Markdown
  const contenidoInforme = generarInformeEstadoProyecto(proyectoId);
  
  // 2. Formatear el nombre de la página wiki
  const nombrePagina = `estado-proyecto-${proyectoId}`;
  
  // 3. Verificar si la página existe
  try {
    await dcsClient.get(`/repos/${propietario}/${repo}/wiki/page/${nombrePagina}`);
    // La página existe, actualizarla
    await dcsClient.patch(`/repos/${propietario}/${repo}/wiki/page/${nombrePagina}`, {
      title: `Estado del Proyecto: ${proyectoId}`,
      content: contenidoInforme,
      message: `Actualizar informe de estado del proyecto - ${new Date().toISOString()}`
    });
  } catch (error) {
    // La página no existe, crearla
    await dcsClient.post(`/repos/${propietario}/${repo}/wiki/new`, {
      title: `Estado del Proyecto: ${proyectoId}`,
      content: contenidoInforme,
      message: `Informe inicial de estado del proyecto`
    });
  }
}
```

### Visualizaciones de Informes

Los informes basados en wiki incluyen ricas visualizaciones creadas con extensiones de Markdown:

1. **Gráficos de Progreso**: Usando diagramas Mermaid para visualizar porcentajes de finalización
   ```markdown
   ```mermaid
   pie title Finalización del Hito 1
       "Completado" : 45
       "En Progreso" : 30
       "No Iniciado" : 25
   ```
   ```

2. **Gráficos de Línea de Tiempo**: Visualizando el cronograma del proyecto y dependencias
   ```markdown
   ```mermaid
   gantt
       title Línea de Tiempo de BTP Génesis
       dateFormat  YYYY-MM-DD
       section Hito 1
       Redacción GLT    :done, m1-glt, 2023-01-01, 30d
       Redacción GST    :active, m1-gst, 2023-01-15, 30d
       section Hito 2
       Revisión GLT      :m2-glt, after m1-glt, 20d
       Revisión GST      :m2-gst, after m1-gst, 20d
   ```
   ```

3. **Gráficos de Dependencia de Tareas**: Mostrando relaciones entre tareas
   ```markdown
   ```mermaid
   graph TD
       A[Redactar GLT] --> B[Revisión por Pares GLT]
       B --> C[Revisión por Equipo GLT]
       A --> D[Escritura de TN]
       C --> E[Armonización]
   ```
   ```

### Generación Automatizada de Informes

El sistema genera informes:

1. **Según Calendario**: Resúmenes diarios/semanales/mensuales
2. **Al Completar Hitos**: Cuando se alcanzan los hitos
3. **Bajo Demanda**: A través de la UI cuando los usuarios solicitan informes específicos
4. **Al Cambiar el Estado**: Cuando ocurren cambios significativos en el estado del proyecto

Este enfoque de informes basado en wiki asegura que todos los interesados tengan acceso a información actualizada del proyecto en un formato limpio y bien organizado sin saturar el repositorio de configuración del proyecto.

## Aprovechando la API de DCS para Características Mejoradas

El Sistema de Gestión de Proyectos de Traducción Bíblica utiliza varios endpoints de la API de Door43 Content Service para implementar características avanzadas más allá de la gestión básica de repositorios. Estos endpoints permiten ricas capacidades de gestión de proyectos mientras mantienen la arquitectura primero-navegador.

### Gestión de Proyectos y Repositorios

#### Creación y Configuración de Repositorios
```typescript
// Crear repositorios programáticamente al configurar nuevos proyectos
async function configurarRepositoriosProyecto(proyecto) {
  for (const repo of proyecto.repositories) {
    await dcsClient.post(`/orgs/${proyecto.organization}/repos`, {
      name: repo.name,
      description: repo.description,
      private: repo.private,
      auto_init: true
    });
    
    // Establecer rama predeterminada
    await dcsClient.patch(`/repos/${proyecto.organization}/${repo.name}`, {
      default_branch: "master"
    });
  }
}
```

#### Permisos de Repositorio y Colaboradores
El sistema gestiona el acceso al repositorio a través de equipos y colaboradores:
```typescript
// Añadir un equipo a un repositorio con permisos específicos
async function añadirEquipoARepositorio(org, repo, nombreEquipo, permiso) {
  await dcsClient.put(`/repos/${org}/${repo}/teams/${nombreEquipo}`, {
    permission: permiso // "read", "write", "admin"
  });
}
```

### Características de Sincronización de Contenido

#### Gestión Directa de Contenido
Para sincronización de plantillas:
```typescript
// Obtener contenido de plantilla del repositorio project-manager
async function obtenerContenidoPlantilla(org, plantilla) {
  const response = await dcsClient.get(
    `/repos/${org}/project-manager/contents/templates/${plantilla}.yaml`
  );
  return Buffer.from(response.content, 'base64').toString('utf8');
}
```

#### Verificación de Contenido
```typescript
// Verificar que el contenido cumpla con los requisitos antes de confirmar
async function verificarYConfirmarContenido(org, repo, ruta, contenido, mensaje) {
  // Primero validar localmente
  if (!validarContenido(contenido)) {
    throw new Error("Falló la validación de contenido");
  }
  
  // Luego confirmar si es válido
  await dcsClient.put(`/repos/${org}/${repo}/contents/${ruta}`, {
    message: mensaje,
    content: Buffer.from(contenido).toString('base64'),
    branch: "master"
  });
}
```

### Seguimiento Mejorado de Proyectos

#### Consulta de Issues Cross-Repository
```typescript
// Obtener todos los issues a través de múltiples repositorios con etiquetas específicas
async function obtenerIssuesProyecto(org, etiquetaProyecto) {
  const todosIssues = [];
  for (const repo of reposProyecto) {
    const issues = await dcsClient.get(
      `/repos/${org}/${repo}/issues?labels=${etiquetaProyecto}`
    );
    todosIssues.push(...issues.map(issue => ({...issue, repository: repo})));
  }
  return todosIssues;
}
```

#### Seguimiento de Actividad
```typescript
// Rastrear actividad reciente a través de todos los repositorios del proyecto
async function obtenerActividadProyecto(org, reposProyecto) {
  const actividad = [];
  for (const repo of reposProyecto) {
    // Obtener commits
    const commits = await dcsClient.get(
      `/repos/${org}/${repo}/commits?limit=10`
    );
    
    // Obtener actividad de issues
    const actividadIssues = await dcsClient.get(
      `/repos/${org}/${repo}/issues/timeline`
    );
    
    actividad.push({
      repository: repo,
      commits: commits,
      issues: actividadIssues
    });
  }
  return actividad;
}
```

### Gestión de Usuarios y Notificaciones

#### Gestión de Equipos
```typescript
// Crear y gestionar equipos para diferentes roles
async function crearEquipoProyecto(org, proyectoId, rol) {
  const nombreEquipo = `${proyectoId}-${rol}`;
  await dcsClient.post(`/orgs/${org}/teams`, {
    name: nombreEquipo,
    description: `Equipo de ${rol} para ${proyectoId}`,
    permission: "write"
  });
  return nombreEquipo;
}
```

#### Notificaciones Personalizadas
Aunque DCS no proporciona creación directa de notificaciones, el sistema aprovecha issues y menciones:
```typescript
// Crear notificación vía comentario de issue
async function notificarEquipo(org, repo, numeroIssue, nombreEquipo, mensaje) {
  await dcsClient.post(
    `/repos/${org}/${repo}/issues/${numeroIssue}/comments`,
    {
      body: `@${nombreEquipo} ${mensaje}`
    }
  );
}
```

### Gestión de Lanzamientos

#### Distribución Binaria y de Paquetes
```typescript
// Crear lanzamientos para recursos compilados
async function crearLanzamientoRecurso(org, repo, version, notas, activos) {
  // Crear el lanzamiento
  const lanzamiento = await dcsClient.post(`/repos/${org}/${repo}/releases`, {
    tag_name: `v${version}`,
    name: `Versión ${version}`,
    body: notas,
    draft: false,
    prerelease: false
  });
  
  // Adjuntar activos (e.g., PDFs compilados)
  for (const activo of activos) {
    await dcsClient.post(
      `/repos/${org}/${repo}/releases/${lanzamiento.id}/assets`,
      activo.data,
      {
        headers: {
          'Content-Type': activo.contentType,
          'Content-Disposition': `attachment; filename=${activo.filename}`
        }
      }
    );
  }
}
```

### Integración de Webhook

El sistema utiliza webhooks para mantenerse sincronizado con cambios en DCS:
```typescript
// Registrarse para notificaciones cuando se actualicen los repositorios
async function configurarWebhooksProyecto(org, repo, urlWebhook) {
  await dcsClient.post(`/repos/${org}/${repo}/hooks`, {
    type: "gitea",
    config: {
      content_type: "json",
      url: urlWebhook
    },
    events: ["push", "issues", "issue_comment", "pull_request"],
    active: true
  });
}
```

### Mejora de Autenticación

#### Gestión de Tokens de Acceso Personal
```typescript
// Crear tokens específicos de aplicación para usuarios
async function crearTokenAccesoUsuario(nombreToken, alcances) {
  return await dcsClient.post(`/users/tokens`, {
    name: nombreToken,
    scopes: alcances // ["repo", "read:org", etc.]
  });
}
```

Al aprovechar estas capacidades de la API de DCS, el Sistema de Gestión de Proyectos de Traducción Bíblica proporciona un rico conjunto de características que se integran profundamente con la plataforma DCS mientras mantiene una arquitectura limpia y modular que podría adaptarse a otras plataformas Git en el futuro.

## Consideraciones de Seguridad

- **Autenticación**: Implementación segura de OAuth con DCS
- **Autorización**: Control de acceso basado en roles para recursos del proyecto
- **Protección de Datos**: Encriptación de datos sensibles
- **Seguridad API**: Gestión segura de tokens y validación de solicitudes

## Estrategia de Despliegue

El Sistema de Gestión de Proyectos de Traducción Bíblica, construido sobre Eclipse Theia, soporta múltiples escenarios de despliegue:

### Aplicación de Escritorio

- **Empaquetado basado en Electron** para Windows, macOS y Linux
- **Capacidad sin conexión** con operaciones Git locales y sincronización periódica
- **Instaladores personalizados** para fácil distribución a equipos de traducción
- **Mecanismo de actualización automática** para asegurar que los usuarios tengan las últimas características y correcciones

### Aplicación Web

- **Alojamiento web estático** que no requiere componentes del lado del servidor
- **Capacidades de Aplicación Web Progresiva (PWA)** para funcionalidad sin conexión
- **Comunicación directa navegador-a-DCS** usando la API de DCS
- **Almacenamiento local** para caché y trabajo sin conexión

### Modo Híbrido

- **Enfoque primero-navegador** con integración backend opcional
- **Arquitectura de backend conectables** para organizaciones que requieren capacidades adicionales
- **Experiencia sincronizada** entre entornos de escritorio y web
- **Resolución de conflictos** para cambios hechos en diferentes entornos

### Integración Backend Opcional

- **Diseño agnóstico de backend** permitiendo a las organizaciones implementar servicios backend personalizados
- **Contratos API estándar** para comunicación con backend
- **Implementaciones de referencia** para escenarios comunes
- **Proxy de autenticación** para seguridad mejorada

### Distribución de Extensiones npm

- **Versionado de extensiones** para asegurar compatibilidad
- **Gestión de dependencias** a través de npm
- **Registro de extensiones** para descubribilidad
- **Guías de instalación** para otras aplicaciones Theia que quieran usar nuestras extensiones

Esta estrategia de despliegue flexible asegura que el Sistema de Gestión de Proyectos de Traducción Bíblica pueda ser usado efectivamente en una variedad de contextos, desde agencias de traducción bien conectadas hasta equipos remotos con acceso limitado a internet, sin requerir infraestructura compleja como contenedores o plataformas de orquestación.

## Primeros Pasos con el Desarrollo

[Las instrucciones de instalación y configuración se añadirán a medida que el proyecto se desarrolle]

---

Volver a [Inicio de Documentación](./README.md) 