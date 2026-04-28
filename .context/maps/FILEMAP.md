---
tipo: mapa
status: estable
ultima_sincronizacion: 2025-04-27
---

# Mapa del Repositorio

> Leyenda: ⚠️ CORE (no tocar sin avisar) | 🔒 STABLE (cambios raros) | 🚧 IN_PROGRESS

## src/

### commands/
Simulación de comandos Linux y Docker. Cada comando es un módulo independiente.

```
commands/
├── linux/
│   ├── index.ts           # Exporta todos los comandos Linux 🔒 STABLE
│   ├── ls.ts              # Listado con flags -l, -a, colores ⚠️ CORE
│   ├── cd.ts              # Cambio de directorio ⚠️ CORE
│   ├── cat.ts             # Visualización de archivos 🔒 STABLE
│   ├── mkdir.ts           # Crear directorios 🔒 STABLE
│   ├── rm.ts              # Eliminar archivos/directorios 🔒 STABLE
│   ├── cp.ts              # Copiar archivos 🔒 STABLE
│   ├── mv.ts              # Mover/renombrar 🔒 STABLE
│   ├── touch.ts           # Crear archivos vacíos 🔒 STABLE
│   ├── echo.ts            # Imprimir texto 🔒 STABLE
│   ├── grep.ts            # Búsqueda con regex 🔒 STABLE
│   ├── find.ts            # Buscar archivos 🔒 STABLE
│   ├── chmod.ts           # Permisos (simulado) 🔒 STABLE
│   ├── ps.ts              # Procesos simulados 🔒 STABLE
│   ├── kill.ts            # Terminar procesos 🔒 STABLE
│   ├── nano.ts            # Editor simulado 🔒 STABLE
│   ├── vim.ts             # Editor vim básico 🔒 STABLE
│   ├── curl.ts            # HTTP simulado 🔒 STABLE
│   ├── wget.ts            # Descargas simuladas 🔒 STABLE
│   ├── ssh.ts             # Conexión SSH simulada 🔒 STABLE
│   ├── [40+ más...]        # Comandos adicionales Linux 🔒 STABLE
│   └── types.ts             # Tipos base para comandos 🔒 STABLE
├── docker/
│   ├── index.ts           # Exporta comandos Docker
│   ├── run.ts             # docker run simulado 🔒 STABLE
│   ├── ps.ts              # Listar contenedores 🔒 STABLE
│   ├── images.ts          # Listar imágenes 🔒 STABLE
│   ├── exec.ts            # Ejecutar en contenedor 🔒 STABLE
│   ├── logs.ts            # Ver logs simulados 🔒 STABLE
│   ├── build.ts           # docker build 🔒 STABLE
│   ├── compose.ts         # docker-compose 🔒 STABLE
│   ├── stop.ts            # Detener contenedores 🔒 STABLE
│   ├── rm.ts              # Eliminar contenedores 🔒 STABLE
│   ├── rmi.ts             # Eliminar imágenes 🔒 STABLE
│   └── pull.ts            # Descargar imágenes 🔒 STABLE
├── useLinuxCommands.ts    # Hook para acceso a comandos Linux 🔒 STABLE
└── useDockerCommands.ts   # Hook para acceso a comandos Docker 🔒 STABLE
```

### components/
UI desacoplada de la lógica de negocio.

```
components/
├── Terminal/
│   ├── TerminalBase.tsx     # Componente base reutilizable 🚧 IN_PROGRESS
│   ├── LinuxTerminal.tsx    # Terminal específica Linux ⚠️ CORE
│   └── DockerTerminal.tsx   # Terminal específica Docker ⚠️ CORE
├── Tutorial/
│   ├── TutorialBase/        # Componentes base de tutoriales 🔒 STABLE
│   │   ├── TutorialPanel.tsx
│   │   ├── LessonCard.tsx
│   │   ├── CommandHint.tsx
│   │   └── ProgressBar.tsx
│   ├── LinuxTutorial.tsx    # Tutorial específico Linux 🔒 STABLE
│   └── DockerTutorial.tsx   # Tutorial específico Docker 🔒 STABLE
├── ui/                      # Componentes Shadcn/ui (49 archivos) 🔒 STABLE
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── toast.tsx
│   └── ...
└── ModeSelector.tsx         # Selector Linux/Docker 🔒 STABLE
```

### pages/
Páginas de la aplicación (SPA con React Router).

```
pages/
├── Index/
│   ├── Index.tsx            # Página principal ⚠️ CORE
│   ├── Header.tsx           # Navegación y modo 🔒 STABLE
│   ├── HeroSection.tsx      # Sección introductoria 🔒 STABLE
│   ├── MainInterface.tsx    # Layout terminal + tutorial 🔒 STABLE
│   ├── FooterSection.tsx    # Pie de página 🔒 STABLE
│   └── features.ts          # Definición de características 🔒 STABLE
└── NotFound.tsx             # Página 404 🔒 STABLE
```

### store/
Gestión de estado global con Zustand.

```
store/
└── terminalStore.ts         # Estado global persistente ⚠️ CORE
```

Estado gestionado:
- `linuxHistory` / `dockerHistory` — Historial de comandos por modo
- `linuxProgress` / `dockerProgress` — Lecciones completadas
- `stats` — Métricas de uso (comandos, archivos, etc.)
- `achievements` — Logros desbloqueados
- `streak` / `lastVisit` — Racha diaria

### data/
Contenido educativo estático.

```
data/
├── linuxLessons.ts          # 15+ lecciones de Linux 🔒 STABLE
└── dockerLessons.ts         # 10+ lecciones de Docker 🔒 STABLE
```

### types/
Definiciones TypeScript globales.

```
types/
└── types.ts                 # Tipos core del proyecto 🔒 STABLE
```

Tipos clave:
- `Command` — Interface para todos los comandos
- `TerminalLine` — Línea de salida (comando/output/error)
- `TerminalSegment` — Fragmento coloreado
- `Lesson` — Estructura de una lección
- `DockerContainer` / `DockerImage` — Entidades Docker

### hooks/
Custom hooks React.

```
hooks/
├── useAchievements.ts       # Lógica de desbloqueo de logros 🔒 STABLE
├── useFileSystem.ts         # Filesystem virtual Linux 🔒 STABLE
├── useDockerFileSystem.ts   # Filesystem/containers Docker 🔒 STABLE
└── [otros...]
```

### lib/
Utilidades y configuración.

```
lib/
├── utils.ts                 # Funciones utilitarias (cn, etc.) 🔒 STABLE
└── [otros...]
```

---

## Archivos de Configuración

| Archivo | Rol |
|:---|:---|
| `vite.config.ts` | Configuración Vite + aliases 🔒 STABLE |
| `tailwind.config.ts` | Configuración Tailwind + tema 🔒 STABLE |
| `tsconfig.json` | Paths y opciones TypeScript 🔒 STABLE |
| `components.json` | Configuración Shadcn/ui 🔒 STABLE |
| `package.json` | Dependencias y scripts 🔒 STABLE |
| `index.html` | Entry point HTML 🔒 STABLE |
