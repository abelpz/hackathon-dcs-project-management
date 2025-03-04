# Entendiendo la Inyección de Dependencias

## El Problema Real: Una App que Crece

Imagina que estás creando una aplicación de tareas que inicialmente es muy simple:

- Guardas las tareas en el localStorage del navegador
- Solo la usas tú y algunos amigos
- Todo funciona perfectamente

Pero luego tu aplicación se vuelve popular y surgen nuevas necesidades:

- Algunos usuarios quieren guardar sus tareas en Google Drive
- Otros necesitan una base de datos porque tienen miles de tareas
- Y otros quieren que funcione sin internet usando almacenamiento local

## La Solución: Código Flexible

Veamos cómo podemos escribir el mismo código de tres formas diferentes, cada una más flexible que la anterior:

### Forma 1: Programación Tradicional (Procedural)

```typescript
// Variables globales
let tareas = [];

// Funciones para manejar el almacenamiento
function cargarTareas() {
    const datos = localStorage.getItem('tareas');
    tareas = datos ? JSON.parse(datos) : [];
}

function guardarTareas() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

// Funciones para manejar tareas
function agregarTarea(titulo: string) {
    tareas.push({
        id: Date.now(),
        titulo,
        completada: false
    });
    guardarTareas();
}

function marcarCompletada(id: number) {
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = true;
        guardarTareas();
    }
}

// Uso del código
cargarTareas();
agregarTarea("Comprar leche");
marcarCompletada(tareas[0].id);
```

### Forma 2: Programación Orientada a Objetos (Básica)

```typescript
class GestorTareas {
    private tareas = [];

    constructor() {
        this.cargar();
    }

    agregarTarea(titulo: string) {
        this.tareas.push({
            id: Date.now(),
            titulo,
            completada: false
        });
        this.guardar();
    }

    marcarCompletada(id: number) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completada = true;
            this.guardar();
        }
    }

    private guardar() {
        localStorage.setItem('tareas', JSON.stringify(this.tareas));
    }

    private cargar() {
        const datos = localStorage.getItem('tareas');
        this.tareas = datos ? JSON.parse(datos) : [];
    }
}

// Uso del código
const gestor = new GestorTareas();
gestor.agregarTarea("Comprar leche");
gestor.marcarCompletada(/* id de la tarea */);
```

### Forma 3: POO con Inyección de Dependencias

```typescript
// 1. Definimos un contrato para el almacenamiento
interface IAlmacenamiento {
    guardar(tareas: any[]): void;
    cargar(): any[];
}

// 2. Creamos una implementación del almacenamiento
@injectable()
class AlmacenamientoLocal implements IAlmacenamiento {
    guardar(tareas: any[]): void {
        localStorage.setItem('tareas', JSON.stringify(tareas));
    }

    cargar(): any[] {
        const datos = localStorage.getItem('tareas');
        return datos ? JSON.parse(datos) : [];
    }
}

// 3. Creamos nuestro gestor que puede usar cualquier tipo de almacenamiento
@injectable()
class GestorTareas {
    private tareas = [];

    constructor(
        @inject(TYPES.Almacenamiento) private almacenamiento: IAlmacenamiento
    ) {
        this.tareas = this.almacenamiento.cargar();
    }

    agregarTarea(titulo: string) {
        this.tareas.push({
            id: Date.now(),
            titulo,
            completada: false
        });
        this.almacenamiento.guardar(this.tareas);
    }

    marcarCompletada(id: number) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completada = true;
            this.almacenamiento.guardar(this.tareas);
        }
    }
}

// Configuración y uso
const container = new Container();
container.bind<IAlmacenamiento>(TYPES.Almacenamiento).to(AlmacenamientoLocal);
const gestor = container.get<GestorTareas>(TYPES.GestorTareas);
gestor.agregarTarea("Comprar leche");
```

## ¿Por Qué Cambiar de Una Forma a Otra?

### De Código Tradicional a POO (De Forma 1 a Forma 2)

- **Problema**: Las variables y funciones están sueltas y es difícil mantener el código
- **Solución**: Agrupamos todo lo relacionado con tareas en una clase
- **Beneficio**: El código es más organizado y fácil de entender

### De POO Simple a Inyección de Dependencias (De Forma 2 a Forma 3)

- **Problema**: Estamos atados a usar localStorage, no podemos cambiar fácilmente dónde guardamos las tareas
- **Solución**: Hacemos que el almacenamiento sea intercambiable
- **Beneficio**: Podemos usar diferentes tipos de almacenamiento sin cambiar el resto del código

## Ejemplo Práctico: Diferentes Tipos de Almacenamiento

### 1. Almacenamiento Local (para desarrollo y uso offline)

```typescript
class AlmacenamientoLocal implements IAlmacenamiento {
    guardar(tareas: any[]): void {
        localStorage.setItem('tareas', JSON.stringify(tareas));
    }

    cargar(): any[] {
        const datos = localStorage.getItem('tareas');
        return datos ? JSON.parse(datos) : [];
    }
}
```

### 2. Almacenamiento en Google Drive (para usuarios que lo prefieran)

```typescript
class AlmacenamientoGoogleDrive implements IAlmacenamiento {
    guardar(tareas: any[]): void {
        // Código para guardar en Google Drive
        googleDrive.guardarArchivo('tareas.json', tareas);
    }

    cargar(): any[] {
        // Código para cargar de Google Drive
        return googleDrive.cargarArchivo('tareas.json');
    }
}
```

### 3. Base de Datos (para usuarios con muchas tareas)

```typescript
class AlmacenamientoBaseDatos implements IAlmacenamiento {
    guardar(tareas: any[]): void {
        // Código para guardar en base de datos
        db.tabla('tareas').guardar(tareas);
    }

    cargar(): any[] {
        // Código para cargar de base de datos
        return db.tabla('tareas').obtenerTodo();
    }
}
```

## Cómo Usar Diferentes Almacenamientos

Lo mejor de todo es que podemos cambiar el tipo de almacenamiento sin tocar el resto del código:

```typescript
// Para usuarios que quieren usar localStorage
container.bind<IAlmacenamiento>(TYPES.Almacenamiento).to(AlmacenamientoLocal);

// Para usuarios que prefieren Google Drive
container.bind<IAlmacenamiento>(TYPES.Almacenamiento).to(AlmacenamientoGoogleDrive);

// Para usuarios que necesitan base de datos
container.bind<IAlmacenamiento>(TYPES.Almacenamiento).to(AlmacenamientoBaseDatos);

// El GestorTareas funciona igual sin importar qué almacenamiento uses
const gestor = container.get<GestorTareas>(TYPES.GestorTareas);
gestor.agregarTarea("Comprar leche");  // ¡Funciona igual con cualquier almacenamiento!
```

## Conclusión

La inyección de dependencias es como tener un teléfono con batería intercambiable:

- Puedes usar diferentes baterías según tus necesidades
- No necesitas modificar el teléfono para cambiar la batería
- El teléfono funciona igual sin importar qué batería uses

En nuestro caso:

- Puedes usar diferentes tipos de almacenamiento según las necesidades
- No necesitas modificar el `GestorTareas` para cambiar el almacenamiento
- La aplicación funciona igual sin importar dónde guardes los datos
