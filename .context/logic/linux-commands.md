---
tipo: logica
modulo: commands-linux
status: stable
tags: [#commands, #linux, #simulation]
ultima_sincronizacion: 2025-04-27
---

# Flujo: Linux Commands

## Descripción
Implementación de 50+ comandos Linux simulados. Cada comando es un módulo independiente que opera sobre el filesystem virtual.

## Paso a Paso

### 1. Estructura de un Comando

```typescript
export const nombreComando: Command = {
  name: "nombre",
  description: "Descripción para help/man",
  execute: (args, fs, history, stdin) => {
    // Lógica del comando
    return [{
      id: Date.now().toString(),
      type: "output" | "error",
      content: "string",
      segments?: TerminalSegment[],  // Para colorear
      timestamp: new Date(),
    }];
  },
};
```

### 2. Categorías de Comandos

#### Navegación (5 comandos)
| Comando | Flags soportadas | Descripción |
|:---|:---|:---|
| `ls` | `-l`, `-a`, `-la` | Lista con colores por tipo |
| `cd` | — | Cambia directorio con path resolution |
| `pwd` | — | Muestra path absoluto actual |
| `which` | — | Ubicación de ejecutable (simulado) |
| `whoami` | — | Devuelve "user" |

#### Archivos (8 comandos)
| Comando | Descripción |
|:---|:---|
| `cat` | Muestra contenido de archivo |
| `touch` | Crea archivo vacío o actualiza timestamp |
| `mkdir` | Crea directorio (soporta `-p`) |
| `rm` | Elimina archivos (`-r` para directorios) |
| `cp` | Copia archivos/directorios (`-r`) |
| `mv` | Mueve o renombra |
| `file` | Detecta tipo de archivo (simulado por extensión) |
| `find` | Busca archivos por nombre |

#### Texto (10 comandos)
| Comando | Descripción |
|:---|:---|
| `echo` | Imprime texto (soporta variables básicas) |
| `grep` | Búsqueda por patrón en archivos o stdin |
| `sed` | Editor de flujo básico (sustitución simple) |
| `head` | Primeras N líneas (`-n`) |
| `tail` | Últimas N líneas (`-n`, `-f` simulado) |
| `wc` | Cuenta líneas/palabras/bytes |
| `sort` | Ordena líneas alfabéticamente |
| `uniq` | Elimina líneas duplicadas consecutivas |
| `cut` | Extrae campos por delimitador |
| `tr` | Translitera caracteres |

#### Sistema (8 comandos)
| Comando | Descripción |
|:---|:---|
| `ps` | Procesos simulados (estáticos) |
| `top` | Monitor de recursos (simulado) |
| `kill` | Envía señal a proceso simulado |
| `df` | Uso de disco (valores simulados) |
| `du` | Uso de directorio (calculado) |
| `free` | Memoria RAM (valores simulados) |
| `uptime` | Tiempo encendido (desde carga de página) |
| `uname` | Info del sistema (simulada) |

#### Red (5 comandos)
| Comando | Descripción |
|:---|:---|
| `ping` | Simula latencia a host |
| `curl` | HTTP GET simulado con respuestas mockeadas |
| `wget` | Descarga simulada de archivo |
| `ssh` | Conexión simulada a servidor remoto |
| `traceroute` | Rutas simuladas |

#### Compresión (1 comando)
| Comando | Descripción |
|:---|:---|
| `tar` | Empaqueta/Desempaqueta (símula, no comprime real) |

#### Permisos (1 comando)
| Comando | Descripción |
|:---|:---|
| `chmod` | Cambia permisos visuales (no afecta operaciones) |

#### Editores (2 comandos)
| Comando | Descripción |
|:---|:---|
| `nano` | Editor interactivo simulado (output estático) |
| `vim` | Modo normal básico simulado |

#### Entorno (4 comandos)
| Comando | Descripción |
|:---|:---|
| `env` | Variables de entorno (simuladas) |
| `export` | Define variable de entorno (sesión actual) |
| `alias` | Crea alias de comandos |
| `history` | Historial de comandos ejecutados |

#### Utilidades (6 comandos)
| Comando | Descripción |
|:---|:---|
| `man` | Páginas de manual simuladas |
| `help` | Lista comandos disponibles con descripción |
| `clear` | Limpia historial del terminal |
| `date` | Fecha/hora actual del sistema |
| `jobs` | Jobs en background (simulados) |
| `kill` | Termina procesos |

### 3. Patrones Comunes

#### Manejo de errores
```typescript
if (!fs.pathExists(path)) {
  return [{
    id: Date.now().toString(),
    type: "error",
    content: `command: cannot access '${path}': No such file or directory`,
    timestamp: new Date(),
  }];
}
```

#### Salida coloreada (ls)
```typescript
const segments: TerminalSegment[] = items.map(item => ({
  text: item.name + '  ',
  color: item.type === 'directory' ? 'dir' :
         item.permissions.startsWith('-rwx') ? 'exec' : 'default',
}));
```

#### Soporte de stdin (para pipes)
```typescript
execute: (args, fs, history, stdin) => {
  const input = stdin || readFile(args[0]);
  // Procesar input
}
```

## Archivos Involucrados
- [[commands/linux/index.ts]] — Barrel export de todos los comandos
- [[useLinuxCommands.ts]] — Hook que expone el registry
- [[types/types.ts]] — Interface `Command`

## Advertencias y Casos de Borde
- ⚠️ Comandos de red (`curl`, `wget`) usan respuestas mockeadas, no hacen fetch real
- ⚠️ `ssh` abre "sesión" simulada, no conecta a servidor real
- ⚠️ Editores (`nano`, `vim`) son simulaciones visuales, no editan realmente
- ⚠️ Flags no soportados se ignoran silenciosamente
