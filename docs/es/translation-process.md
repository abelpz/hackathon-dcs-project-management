# Proceso de Producción de Paquetes de Traducción de Libros

Este documento describe el proceso establecido de 8 hitos utilizado para crear Paquetes de Traducción de Libros. El Sistema de Gestión de Proyectos de Traducción Bíblica que estamos desarrollando será diseñado para apoyar y optimizar este proceso.

## Visión General del Proceso

El Proceso de Producción de Paquetes de Traducción de Libros consta de 8 hitos distintos, cada uno con objetivos específicos, participantes, metodologías y entregables:

### Hito 1: Fase de Borrador
La creación inicial de traducciones tanto literales como simplificadas a partir de textos fuente.

### Hito 2: Fase de Revisión Inicial
Revisiones por pares y en equipo de las traducciones borradores para identificar y abordar problemas.

### Hito 3: Fase de Validación Técnica
Verificación del formato, estándares técnicos e integridad estructural de las traducciones.

### Hito 4: Fase de Alineación
Establecimiento de conexiones entre las partes correspondientes de las traducciones literales y simplificadas.

### Hito 5: Fase de Traducción de Recursos de Apoyo
Creación de notas de traducción, entradas de diccionario y preguntas de comprensión.

### Hito 6: Fase de Armonización
Asegurar la consistencia en todos los componentes del Paquete de Traducción del Libro.

### Hito 7: Fase de Revisión por Expertos
Revisión exhaustiva por expertos en idiomas y teología para verificar la precisión y claridad.

### Hito 8: Fase de Finalización Técnica
Formato final, empaquetado y preparación para la distribución.

## Infraestructura de Repositorios

El proceso de traducción está respaldado por una robusta infraestructura de repositorios que organiza todos los recursos de traducción dentro de repositorios Git alojados en la plataforma Door43 Content Service (DCS). Esta infraestructura existe independientemente de nuestra aplicación de gestión de proyectos, pero será integrada con ella.

### Organización de Repositorios

Los recursos están organizados bajo organizaciones específicas por idioma dentro de DCS (por ejemplo, `es-419_gl` para español latinoamericano). Cada componente del Paquete de Traducción del Libro se mantiene en su propio repositorio dedicado:

- **Libros Simplificados**: `es-419_gl/es-419_gst` 
- **Libros Literales**: `es-419_gl/es-419_glt`
- **Notas de Traducción**: `es-419_gl/es-419_tn`
- **Diccionario de Traducción**: `es-419_gl/es-419_tw`
- **Academia de Traducción**: `es-419_gl/es-419_ta`
- **Preguntas de Traducción**: `es-419_gl/es-419_tq`

### Beneficios de la Estructura de Repositorios

Esta estructura de repositorios proporciona varios beneficios clave para el proceso de traducción:

1. **Flujos de Trabajo Paralelos**: Diferentes equipos pueden trabajar simultáneamente en diferentes componentes (por ejemplo, traducción literal, traducción simplificada y notas).

2. **Control de Versiones Robusto**: Todos los cambios son rastreados con historial completo, permitiendo fácilmente revertir y comparar entre versiones.

3. **Colaboración Distribuida**: Miembros del equipo en diferentes ubicaciones pueden contribuir al mismo proyecto a través de la naturaleza distribuida de Git.

4. **Control de Calidad**: Las reglas de protección de ramas y revisiones de solicitudes de cambios aseguran que todas las contribuciones cumplan con los estándares de calidad antes de la integración.

5. **Clara Separación de Responsabilidades**: Cada componente tiene su propio repositorio, permitiendo a equipos especializados centrarse en sus áreas de experiencia.

6. **Integración en Hitos Clave**: Los repositorios separados se unen en puntos específicos del proceso, particularmente durante las fases de Alineación (Hito 4) y Armonización (Hito 6).

La infraestructura de repositorios es especialmente importante durante las fases de Validación Técnica (Hito 3) y Finalización Técnica (Hito 8), donde la organización adecuada e integración de componentes son cruciales para la finalización exitosa del proyecto.

## Características del Flujo de Trabajo

El flujo de trabajo de traducción tiene varias características clave:

1. **Dependencias Secuenciales**: Ciertos hitos deben completarse antes de que otros puedan comenzar

2. **Oportunidades de Trabajo Paralelo**: Algunos componentes pueden ser desarrollados simultáneamente

3. **Puertas de Calidad**: Cada hito incluye medidas específicas de aseguramiento de calidad

4. **Refinamiento Iterativo**: Múltiples ciclos de revisión y corrección para mejora continua

5. **Entorno Colaborativo**: Múltiples interesados contribuyen a lo largo del proceso

## Cómo Nuestro Sistema de Gestión de Proyectos Apoyará Este Proceso

El Sistema de Gestión de Proyectos de Traducción Bíblica que estamos desarrollando proporcionará herramientas especializadas para apoyar cada aspecto del Proceso de Producción de Paquetes de Traducción de Libros:

### Seguimiento de Hitos

Nuestra aplicación:
- Guiará a los usuarios a través de cada hito con asignaciones claras de tareas
- Rastreará el progreso y finalización de entregables de hitos
- Proporcionará listas de verificación para requisitos de calidad
- Hará cumplir las dependencias entre hitos

### Integración de Repositorios

Nuestra aplicación:
- Se conectará con la infraestructura de repositorios DCS
- Extraerá información de estado de los repositorios
- Facilitará operaciones de repositorio sin requerir experiencia en Git
- Gestionará la protección de ramas y flujos de trabajo de revisión

### Coordinación de Equipo

Nuestra aplicación:
- Asignará roles basados en experiencia y disponibilidad
- Rastreará el progreso individual y del equipo
- Facilitará la comunicación entre miembros del equipo
- Coordinará las transferencias entre hitos

### Aseguramiento de Calidad

Nuestra aplicación:
- Implementará verificaciones de validación en puntos clave
- Rastreará revisiones y mejoras
- Proporcionará flujos de trabajo de revisión
- Generará informes de métricas de calidad

### Gestión de Recursos

Nuestra aplicación:
- Ayudará a asignar traductores, revisores y consultores
- Optimizará el uso de recursos a través de flujos de trabajo paralelos
- Identificará cuellos de botella y restricciones de recursos
- Proyectará impactos en la línea de tiempo basados en la asignación de recursos

## Documentación

La documentación detallada para cada hito está disponible en el directorio de Hitos:

- [Hito 1: Fase de Borrador](./milestones/milestone1.md)
- [Hito 2: Fase de Revisión Inicial](./milestones/milestone2.md)
- [Hito 3: Fase de Validación Técnica](./milestones/milestone3.md)
- [Hito 4: Fase de Alineación](./milestones/milestone4.md)
- [Hito 5: Fase de Traducción de Recursos de Apoyo](./milestones/milestone5.md)
- [Hito 6: Fase de Armonización](./milestones/milestone6.md)
- [Hito 7: Fase de Revisión por Expertos](./milestones/milestone7.md)
- [Hito 8: Fase de Finalización Técnica](./milestones/milestone8.md)

Estos documentos proporcionan información completa sobre los participantes, metodologías, indicadores de calidad, entregables y otros aspectos de cada hito. Esta información informará directamente el desarrollo de las características de nuestra aplicación.

---

Siguiente: Vea la [Visualización del Flujo de Trabajo](./workflow.md)  
Volver a [Inicio de la Documentación](./README.md) 