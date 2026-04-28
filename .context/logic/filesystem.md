---
tipo: logica
modulo: filesystem
status: stable
tags: [#filesystem, #virtual, #state]
ultima_sincronizacion: 2025-04-27
---

# Flujo: Filesystem Virtual

## Descripción
Sistema de archivos completamente en memoria que simula comportamiento UNIX. Soporta dos instancias independientes: Linux (tree inicial) y Docker (volúmenes/containers).

## Paso a Paso

### 1. Estructura de Datos

#### Linux FileSystem
```typescript
interface FileSystem {
  root: Directory;           // Nodo raíz
  currentPath: string;       // Path actual (ej: "/home/user")
  currentDir: Directory;     // Referencia al nodo actual
}

interface Directory {
  name: string;
  type: "directory";
  children: (File | Directory)[];
  permissions: string;       // "drwxr-xr-x"
  owner: string;
  group: string;
  modified: Date;
}

interface File {
  name: string;
  type: "file";
  content: string;
  permissions: string;       // "-rw-r--r--"
  owner: string;
  group: string;
  size: number;
  modified: Date;
}
```

#### Docker FileSystem
```typescript
interface DockerState {
  containers: DockerContainer[];
  images: DockerImage[];
  volumes: Volume[];
}
```

### 2. Inicialización Linux

1. **Estructura por defecto:**
   ```
   /
   ├── bin/           # Comandos del sistema (vacío, simbólico)
   ├── etc/
   │   └── hosts      # File de ejemplo
   ├── home/
   │   └── user/      # Directorio del usuario
   │       ├── documents/
   │       ├── downloads/
   │       └── projects/
   ├── tmp/           # Temporales
   ├── usr/
   │   └── share/
   │       └── doc/   # Documentación
   └── var/
       └── log/       # Logs simulados
   ```

2. **Archivos de ejemplo pre-creados:**
   - `/etc/hosts` — IPs locales
   - `/home/user/readme.txt` — Archivo de bienvenida
   - `/var/log/syslog` — Log de ejemplo

### 3. Operaciones Soportadas

| Operación | Método | Descripción |
|:---|:---|:---|
| `pathExists(path)` | boolean | Verifica si path existe |
| `getDirectory(path)` | (File\|Directory)[] | Lista contenido |
| `getFile(path)` | File | Obtiene archivo |
| `createDirectory(path)` | void | Crea directorio |
| `createFile(path, content)` | void | Crea archivo |
| `delete(path)` | void | Elimina archivo/dir |
| `move(from, to)` | void | Mueve/renombra |
| `copy(from, to)` | void | Copia recursiva |
| `resolvePath(path)` | string | Normaliza path (. .. ~) |

### 4. Resolución de Paths

1. Path absoluto (`/home/user`) → usa directo
2. Path relativo (`documents`) → concatena a `currentPath`
3. Home shortcut (`~`) → expande a `/home/user`
4. Parent (`..`) → navega al padre
5. Current (`.`) → se ignora

### 5. Persistencia

- **Linux:** No persiste entre sesiones. Se resetea al inicial.
- **Docker:** Containers e imágenes se mantienen en estado hasta `rm`/`rmi`.
- Estado volátil intencionalmente (sandbox).

## Archivos Involucrados
- [[useFileSystem.ts]] — Hook Linux filesystem
- [[useDockerFileSystem.ts]] — Hook Docker filesystem/containers
- Comandos que operan sobre FS: `ls.ts`, `cd.ts`, `cat.ts`, `mkdir.ts`, `rm.ts`, `cp.ts`, `mv.ts`, `touch.ts`, `find.ts`

## Advertencias y Casos de Borde
- ⚠️ No hay cuotas de disco; `df` devuelve valores simulados
- ⚠️ Permisos (`chmod`) son visuales; no restringen operaciones
- ⚠️ No hay usuarios reales; `chown` es simulado
- ⚠️ Archivos binarios se tratan como texto
- ⚠️ Límite de profundidad de directorios: 100 niveles (protección stack overflow)
