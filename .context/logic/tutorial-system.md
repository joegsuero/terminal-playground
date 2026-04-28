---
tipo: logica
modulo: tutorial
status: stable
tags: [#tutorial, #lessons, #education]
ultima_sincronizacion: 2025-04-27
---

# Flujo: Tutorial System

## Descripción
Sistema de lecciones interactivas que guía al usuario mediante comandos esperados, retroalimentación inmediata y progreso persistente.

## Paso a Paso

### 1. Estructura de una Lección

```typescript
interface Lesson {
  id: string;                    // Identificador único
  title: string;                 // Título mostrado
  description: string;           // Explicación del objetivo
  commands: string[];            // Comandos que el usuario debe ejecutar
  commandExplanations: string[]; // Explicación de cada comando
  expectedOutputs?: string[];    // Outputs esperados (para validación)
}
```

### 2. Progreso del Usuario

1. **Carga inicial:**
   - Lee `linuxProgress` y `dockerProgress` de [[terminalStore.ts]]
   - Array de IDs de lecciones completadas

2. **Marcar completada:**
   - Usuario ejecuta comando esperado
   - Sistema detecta match
   - Añade lesson ID al array de progreso
   - Persiste automáticamente

### 3. Renderizado

1. [[TutorialPanel]] (base) muestra:
   - Lista de lecciones con estado (✅ completada / 🚧 pendiente)
   - Lección activa destacada
   - Botón "Siguiente" / "Anterior"

2. [[LessonCard]] muestra:
   - Título de lección
   - Descripción del objetivo
   - Lista de comandos a practicar
   - Tooltips con explicaciones

### 4. Detección de Completado

**Lógica de match:**
```
comando_ejecutado.strip() == comando_esperado.strip()
```

- Match exacto del comando base
- Argumentos deben coincidir (para flags específicos)
- No hay validación fuzzy (por diseño: precisión educativa)

### 5. Lecciones Linux (15+)

1. Navegación básica (`ls`, `pwd`, `cd`)
2. Crear archivos (`touch`, `mkdir`)
3. Manipular archivos (`cp`, `mv`, `rm`)
4. Ver contenido (`cat`, `head`, `tail`)
5. Búsqueda (`find`, `grep`)
6. Permisos (`chmod`)
7. Procesos (`ps`, `top`, `kill`)
8. Red (`ping`, `curl`)
9. Compresión (`tar`)
10. Editores (`nano` básico)

### 6. Lecciones Docker (10+)

1. Primeros pasos (`docker run hello-world`)
2. Listar contenedores (`docker ps`)
3. Imágenes (`docker images`, `docker pull`)
4. Ejecutar comandos (`docker exec`)
5. Logs (`docker logs`)
6. Detener/eliminar (`docker stop`, `docker rm`)
7. Docker Compose básico

## Archivos Involucrados
- [[linuxLessons.ts]] — Definición de lecciones Linux
- [[dockerLessons.ts]] — Definición de lecciones Docker
- [[TutorialPanel.tsx]] — Componente base
- [[LessonCard.tsx]] — Tarjeta de lección individual
- [[LinuxTutorial.tsx]] — Wrapper específico Linux
- [[DockerTutorial.tsx]] — Wrapper específico Docker
- [[terminalStore.ts]] — Persistencia de progreso

## Advertencias y Casos de Borde
- ⚠️ Lecciones con múltiples comandos deben ejecutarse en orden
- ⚠️ Si el usuario ejecuta `clear`, el historial se pierde pero el progreso se mantiene
- ⚠️ Cambio de modo Linux↔Docker resetea la lección activa visualmente
