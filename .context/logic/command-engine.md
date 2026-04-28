---
tipo: logica
modulo: commands
status: stable
tags: [#commands, #parsing, #execution]
ultima_sincronizacion: 2025-04-27
---

# Flujo: Command Engine

## Descripción
Sistema de parsing, routing y ejecución de comandos. Soporta comandos simples y pipelines con pipes (`|`).

## Paso a Paso

### 1. Parsing de Input
1. Input raw del usuario llega a `handleCommand()`
2. Se detecta presencia de `|` para decidir modo:
   - Sin `|` → modo simple
   - Con `|` → modo pipeline

### 2. Modo Simple
1. Split por espacios: `args = input.trim().split(/\s+/)`
2. `commandName = args[0]`
3. Se busca en registry:
   - Modo Linux → `linuxCommands[commandName]`
   - Modo Docker → `dockerCommands[commandName]`
4. Si no existe → línea de error "command not found"
5. Si existe → `command.execute(args.slice(1), fs, history)`

### 3. Modo Pipeline
1. Split por `|`: `stages = input.split('|').map(s => s.trim())`
2. Para cada stage:
   - Parsear como comando simple
   - `stdin` del stage N = concatenación de `stdout` del stage N-1
3. Ejecutar en secuencia
4. Combinar outputs en orden

### 4. Manejo de Errores
- Comando no encontrado → `type: "error"`, mensaje amigable
- Error de ejecución → capturado y convertido a `TerminalLine[]` con `type: "error"`
- Pipeline parcial fallido → stages posteriores reciben string vacío

## Estructura de un Comando

```typescript
// Interface Command
{
  name: string;           // Identificador único
  description: string;    // Para help/man
  execute: (
    args: string[],      // Flags y argumentos
    fs: FileSystem,      // Filesystem virtual del modo
    commandHistory?: string[], // Historial para `history`, `!!`
    stdin?: string       // Input de pipe anterior
  ) => TerminalLine[];   // Líneas de salida
}
```

## Registro de Comandos

### Linux (`useLinuxCommands.ts`)
50+ comandos exportados desde `commands/linux/index.ts`:
- Navegación: `ls`, `cd`, `pwd`
- Archivos: `cat`, `touch`, `mkdir`, `rm`, `cp`, `mv`
- Texto: `echo`, `grep`, `sed`, `awk`, `head`, `tail`, `wc`
- Sistema: `ps`, `top`, `kill`, `df`, `du`, `free`, `uptime`
- Red: `ping`, `curl`, `wget`, `ssh`
- Utilidades: `find`, `sort`, `uniq`, `tar`, `chmod`, `file`
- Editores: `nano`, `vim`
- Otros: `alias`, `export`, `env`, `history`, `which`, `whoami`, `man`, `clear`

### Docker (`useDockerCommands.ts`)
12+ comandos exportados desde `commands/docker/index.ts`:
- `docker run`, `docker ps`, `docker images`
- `docker exec`, `docker logs`, `docker build`
- `docker stop`, `docker rm`, `docker rmi`, `docker pull`
- `docker-compose up/down/logs/build`

## Archivos Involucrados
- [[useLinuxCommands.ts]] — Hook y registry Linux
- [[useDockerCommands.ts]] — Hook y registry Docker
- [[commands/linux/index.ts]] — Barrel export Linux
- [[commands/docker/index.ts]] — Barrel export Docker

## Advertencias y Casos de Borde
- ⚠️ Pipes anidados profundos (>3) pueden degradar performance
- ⚠️ `stdin` en pipelines es string plano; no se preservan colores
- ⚠️ Comandos que modifican filesystem en pipeline pueden tener efectos colaterales no deseados
- ⚠️ No hay soporte para redirects (`>`, `>>`, `<`)
