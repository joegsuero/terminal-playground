---
tipo: logica
modulo: terminal
status: stable
tags: [#terminal, #ui, #rendering]
ultima_sincronizacion: 2025-04-27
---

# Flujo: Terminal Core

## Descripción
Gestiona el ciclo de vida visual del terminal: entrada de usuario, renderizado de salida, historial y cambio de modo Linux/Docker.

## Paso a Paso

### 1. Inicialización
1. [[TerminalBase.tsx]] monta el componente base
2. Lee `mode` del estado local ("linux" | "docker")
3. Carga historial persistente desde [[terminalStore.ts]]
4. Renderiza prompt inicial

### 2. Ciclo de Entrada
1. Usuario escribe comando en input
2. `onSubmit` captura el texto
3. Se añade línea tipo "command" al historial
4. Se parsea el input:
   - Detección de pipes (`|`)
   - Separación en tokens
   - Identificación del comando base

### 3. Ejecución
1. Si hay pipes: [[command-engine.md]] orquesta pipeline
2. Si comando simple: se busca en registry (Linux o Docker)
3. Se ejecuta `Command.execute(args, fs, history, stdin)`
4. Se recibe array de `TerminalLine[]`

### 4. Renderizado de Salida
1. Cada `TerminalLine` se renderiza según `type`:
   - `command` — Línea con prompt verde
   - `output` — Texto con colores por `segments`
   - `error` — Texto rojo en stderr
2. Scroll automático al final
3. Nuevo prompt listo

### 5. Persistencia
1. Cada comando ejecutado actualiza stats en store
2. Historial se sincroniza automáticamente (Zustand persist)
3. Achievements se evalúan tras cada comando

## Archivos Involucrados
- [[TerminalBase.tsx]] — Componente base con lógica común
- [[LinuxTerminal.tsx]] — Terminal específica con filesystem Linux
- [[DockerTerminal.tsx]] — Terminal específica con containers Docker
- [[terminalStore.ts]] — Persistencia de estado

## Decisiones Relevantes
- Ver [[decisions/ADR-001-terminal-abstraction.md]] — Por qué TerminalBase es genérico

## Advertencias y Casos de Borde
- ⚠️ El historial puede crecer indefinidamente; no hay truncamiento automático
- ⚠️ localStorage tiene límite ~5MB; historial muy largo puede fallar
- ⚠️ Cambio de modo (`linux` ↔ `docker`) no preserva input pendiente
