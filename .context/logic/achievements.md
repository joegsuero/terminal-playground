---
tipo: logica
modulo: achievements
status: stable
tags: [#achievements, #gamification, #stats]
ultima_sincronizacion: 2025-04-27
---

# Flujo: Achievements System

## Descripción
Sistema de gamificación con logros desbloqueables basado en métricas de uso y comportamiento del usuario.

## Paso a Paso

### 1. Tipos de Logros

| Categoría | Métrica | Ejemplos |
|:---|:---|:---|
| **Volumen** | Contadores acumulativos | "100 comandos ejecutados" |
| **Streak** | Días consecutivos | "Racha de 7 días" |
| **Especificidad** | Uso de comando particular | "Usaste grep 10 veces" |
| **Exploración** | Diversidad de comandos | "Usaste 20 comandos distintos" |
| **Mastery** | Completitud de lecciones | "Completaste todos los tutoriales Linux" |

### 2. Estructura de un Logro

```typescript
interface Achievement {
  id: string;           // Identificador único
  title: string;        // Nombre mostrado
  description: string;  // Cómo desbloquearlo
  icon: string;         // Nombre del icono Lucide
  condition: (stats: Stats, progress: string[]) => boolean;
}
```

### 3. Stats Trackeadas

```typescript
interface Stats {
  commandsExecuted: number;      // Total de comandos
  filesCreated: number;           // touch, mkdir, redirects
  filesDeleted: number;           // rm, rmdir
  directoriesNavigated: number; // cd (conteo de veces)
  grepUsed: number;              // Usos de grep específicamente
  pipesUsed: number;             // Comandos con pipe |
  clearUsed: number;             // Usos de clear
  vimUsed: number;               // Aperturas de vim
  helpUsed: number;              // Usos de help/man
}
```

### 4. Flujo de Desbloqueo

1. **Trigger:**
   - Cada comando ejecutado llama a `updateStats(stat, increment)`
   - Store actualiza el contador correspondiente

2. **Evaluación:**
   - Hook `useAchievements` se suscribe a cambios de stats
   - Itera achievements pendientes
   - Ejecuta `condition(stats, progress)`

3. **Desbloqueo:**
   - Si condición = true → `unlockAchievement(achievement)`
   - Añade al array `achievements` en store
   - Muestra toast de notificación

4. **Persistencia:**
   - Logros desbloqueados persisten en localStorage
   - No se pueden "perder" ni resetear individualmente

### 5. Logros Definidos

| ID | Título | Condición |
|:---|:---|:---|
| `first_steps` | Primeros Pasos | 1 comando ejecutado |
| `busy_bee` | Abeja Ocupada | 50 comandos |
| `power_user` | Usuario Avanzado | 100 comandos |
| `search_master` | Maestro de Búsqueda | grep usado 10 veces |
| `pipe_wizard` | Mago de Pipes | 5 pipes usados |
| `clean_freak` | Fanático de Limpieza | clear usado 10 veces |
| `file_manager` | Gestor de Archivos | 10 archivos creados |
| `navigator` | Navegante | 20 cambios de directorio |
| `linux_novice` | Novicio Linux | 5 lecciones Linux completadas |
| `linux_expert` | Experto Linux | Todas las lecciones Linux |
| `docker_novice` | Novicio Docker | 5 lecciones Docker completadas |
| `docker_expert` | Experto Docker | Todas las lecciones Docker |
| `week_warrior` | Guerrero de la Semana | Racha de 7 días |
| `vim_survivor` | Sobreviviente de Vim | Abrió vim 3 veces |

### 6. Streak System

1. **Lógica de racha:**
   - `lastVisit` guarda fecha última visita
   - Al iniciar: compara con hoy y ayer
   - Hoy = `lastVisit` → sin cambio
   - Ayer = `lastVisit` → streak++
   - Otro → streak = 1

2. **Persistencia:**
   - Actualiza `lastVisit` a fecha de hoy
   - Guarda nueva racha

## Archivos Involucrados
- [[useAchievements.ts]] — Hook de evaluación y desbloqueo
- [[terminalStore.ts]] — Persistencia de stats y achievements
- Componente Toast — Notificación visual de desbloqueo

## Advertencias y Casos de Borde
- ⚠️ `resetAll()` en store limpia TODOS los logros (intencional para debug)
- ⚠️ Stats de comandos específicos (grep, vim) requieren que cada comando incremente manualmente
- ⚠️ Si falta incrementar un stat en un comando, el logro asociado nunca se desbloqueará
