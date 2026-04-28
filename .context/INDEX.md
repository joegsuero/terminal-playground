# Índice de la Wiki — Terminal Playground

**Navegación rápida para agentes de código.**

---

## 📁 Estructura de la Wiki

| Archivo | Propósito |
|:---|:---|
| [[PROJECT.md]] | Visión del proyecto, stack tecnológico, reglas no negociables |
| [[maps/FILEMAP.md]] | Árbol anotado del repositorio con responsabilidades |
| [[logic/]] | Flujos de negocio: terminal, comandos, tutoriales, filesystem |
| [[state/STATE.md]] | Estado actual: tareas en progreso, bugs, deuda técnica |
| [[decisions/]] | Decisiones arquitectónicas (ADRs) |

---

## 🚀 Protocolo de Inicio

Antes de cualquier tarea:
1. Leer [[PROJECT.md]] para entender el contexto
2. Leer [[state/STATE.md]] para el estado actual
3. Si tocas un módulo específico → leer su `logic/*.md`
4. Si creas/archivas archivos → actualizar `maps/FILEMAP.md`

---

## 🧭 Módulos Principales

### Terminal
- [[logic/terminal-core.md]] — Ciclo de vida del terminal y renderizado
- [[logic/command-engine.md]] — Parsing y ejecución de comandos
- [[logic/filesystem.md]] — Sistema de archivos virtual

### Comandos
- [[logic/linux-commands.md]] — Implementación de 50+ comandos Linux
- [[logic/docker-commands.md]] — Simulación de comandos Docker

### Tutoriales
- [[logic/tutorial-system.md]] — Sistema de lecciones interactivas
- [[logic/achievements.md]] — Sistema de logros y estadísticas

---

## 📊 Estado del Proyecto

Ver [[state/STATE.md]] para:
- Tareas en progreso
- Bugs abiertos
- Próximos pasos
- Discrepancias detectadas

---

*Última actualización: 2025-04-27*
