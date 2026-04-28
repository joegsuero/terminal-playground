---
tipo: decision
status: activo
fecha: 2025-04-27
---

# ADR-001: TerminalBase como Abstracción Genérica

## Contexto
Necesitábamos dos terminales con comportamiento similar pero filesystems diferentes (Linux vs Docker). La duplicación de código de renderizado, historial y UI era evidente.

## Decisión
Crear `TerminalBase` como componente genérico que recibe:
- `mode`: "linux" | "docker"
- `history`: TerminalLine[]
- `onExecute`: (command: string) => TerminalLine[]
- `prompt`: string

Las terminales específicas (`LinuxTerminal`, `DockerTerminal`) actúan como wrappers que inyectan las dependencias correctas.

## Razón
- Evita duplicación de lógica de UI (scroll, input, renderizado)
- Permite añadir nuevos modos de terminal fácilmente
- Facilita testing al inyectar mocks

## Alternativas Consideradas
- **Duplicar código**: descartada por mantenimiento costoso
- **Hooks composables**: descartada por complejidad innecesaria para el alcance actual

## Consecuencias
- ✅ Menos código duplicado
- ✅ Cambios de UI aplican a ambos modos simultáneamente
- ⚠️ `TerminalBase` puede crecer en props si se añaden más features

## Qué se Rompe si se Ignora Esta Decisión
- Inconsistencias visuales entre modos
- Bug fixes duplicados en dos archivos
- Dificultad para añadir un tercer modo (ej: Kubernetes)
