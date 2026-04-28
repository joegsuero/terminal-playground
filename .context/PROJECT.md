---
tipo: proyecto
status: estable
ultima_sincronizacion: 2025-04-27
---

# Terminal Playground

## Qué es
Plataforma educativa browser-based para aprender Linux y Docker sin configuración local ni riesgo de dañar el sistema.

## Stack Tecnológico
| Capa | Tecnología |
|:---|:---|
| Frontend | React 18 + TypeScript |
| Estado | Zustand + persistencia localStorage |
| UI | Shadcn/ui + Tailwind CSS |
| Router | React Router DOM |
| Query | TanStack Query |
| Build | Vite |
| Deploy | GitHub Pages |

## Arquitectura en Una Línea
SPA React con sistema de comandos simulados (filesystem virtual + parsers de texto) y tutoriales interactivos con estado persistente en localStorage.

## Decisiones No Negociables
| DECISIÓN | RAZÓN | SI LA ROMPES |
|:---|:---|:---|
| Simulación, no emulación real | Seguridad para usuarios principiantes | Expone el sistema host |
| localStorage para persistencia | Zero-backend, deploy en GH Pages | Pierde datos al limpiar navegador |
| Cada comando es un módulo independiente | Facilita añadir nuevos comandos | Acoplamiento en comandos complejos |
| Filesystem virtual en memoria | Rendimiento y control total | Inconsistencias con comportamiento real |
| Dark mode por defecto | Experiencia "terminal auténtica" | Rompe expectativa visual de usuarios |

## Reglas de Operación
- Cada comando Linux tiene su archivo en `src/commands/linux/[comando].ts`
- Los comandos Docker tienen su propio filesystem y contenedores simulados
- Los tutoriales definen lecciones con comandos esperados y explicaciones
- El store persiste automáticamente progreso, stats y achievements
- Los componentes de terminal no contienen lógica de parsing

## Antipatrones del Proyecto
- No usar `eval()` o ejecución real de comandos en el sistema host
- No acoplar lógica de comandos con el componente UI del terminal
- No hardcodear paths del filesystem; usar siempre el filesystem virtual
- No romper el contrato `Command.execute(args, fs, history, stdin)`

## Glosario del Dominio
| Término | Definición |
|:---|:---|
| **Modo Linux** | Terminal simulando shell bash con filesystem UNIX |
| **Modo Docker** | Terminal simulando Docker CLI con contenedores virtuales |
| **Lesson** | Unidad didáctica con comandos a practicar |
| **Achievement** | Logro desbloqueado por métricas (streak, comandos usados) |
| **Filesystem Virtual** | Estructura de directorios/archivos en memoria, no real |
| **TerminalSegment** | Fragmento de salida con color (dir, exec, link, etc.) |
| **Command** | Objeto con `name`, `description`, `execute(args, fs)` |
