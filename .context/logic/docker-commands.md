---
tipo: logica
modulo: commands-docker
status: stable
tags: [#commands, #docker, #containers]
ultima_sincronizacion: 2025-04-27
---

# Flujo: Docker Commands

## Descripción
Simulación de Docker CLI con contenedores e imágenes virtuales. Permite practicar comandos Docker sin necesidad de Docker real instalado.

## Paso a Paso

### 1. Entidades Docker Virtualizadas

```typescript
interface DockerContainer {
  id: string;           // Hash corto (ab12cd34)
  name: string;         // Nombre asignado o generado
  image: string;        // Imagen base
  status: "running" | "stopped" | "created";
  ports: string[];      // Mapeos "host:container"
  created: string;      // Timestamp legible
}

interface DockerImage {
  id: string;           // Hash completo
  repository: string;   // Nombre (nginx, ubuntu)
  tag: string;          // Versión (latest, 1.0)
  size: string;         // Tamaño legible ("133MB")
  created: string;      // Timestamp
}

interface DockerVolume {
  name: string;
  mountPoint: string;
}
```

### 2. Comandos Implementados

#### Gestión de Contenedores
| Comando | Flags | Descripción |
|:---|:---|:---|
| `docker run` | `-d`, `-p`, `-v`, `-e`, `--name` | Crea e inicia contenedor |
| `docker ps` | `-a` | Lista contenedores activos/todos |
| `docker stop` | - | Detiene contenedor running |
| `docker start` | - | Inicia contenedor stopped |
| `docker rm` | `-f` | Elimina contenedor |
| `docker exec` | `-it` | Ejecuta comando en contenedor |
| `docker logs` | `-f` | Muestra logs simulados |

#### Gestión de Imágenes
| Comando | Flags | Descripción |
|:---|:---|:---|
| `docker images` | - | Lista imágenes descargadas |
| `docker pull` | - | Descarga imagen (simulado) |
| `docker rmi` | - | Elimina imagen |
| `docker build` | `-t` | Build de Dockerfile (simulado) |

#### Docker Compose
| Comando | Descripción |
|:---|:---|
| `docker-compose up` | Inicia servicios definidos |
| `docker-compose down` | Detiene y elimina servicios |
| `docker-compose ps` | Estado de servicios |
| `docker-compose logs` | Logs de servicios |
| `docker-compose build` | Build de imágenes |

### 3. Flujo de `docker run`

1. Parsear flags (`-d`, `-p`, `-v`, `-e`, `--name`)
2. Verificar que imagen existe (si no, error sugerente)
3. Generar ID único (8 chars hex)
4. Asignar nombre (flag o `/romantic_wozniak`)
5. Parsear mapeos de puertos y volúmenes
6. Añadir a lista de contenedores con status "running"
7. Output: ID largo del contenedor

### 4. Flujo de `docker exec`

1. Buscar contenedor por ID o nombre
2. Verificar status = "running"
3. Si `-it` → simula shell interactivo
4. Ejecutar comando "dentro" del contexto del contenedor
5. Retornar output simulado según imagen base

### 5. Imágenes Pre-disponibles

- `hello-world` — Contenedor de prueba básico
- `nginx` — Web server (simula respuestas HTTP)
- `ubuntu` — Shell bash disponible
- `node` — Entorno Node.js
- `python` — Entorno Python
- `redis` — Simula operaciones Redis básicas
- `mysql` — Simula queries básicas
- `postgres` — Simula conexión PostgreSQL

### 6. Estados de Contenedor

```
created → running → stopped → removed
   ↑___________|
```

- Transiciones automáticas según comandos
- `docker rm -f` permite eliminar running directamente

## Archivos Involucrados
- [[commands/docker/index.ts]] — Barrel export
- [[useDockerCommands.ts]] — Hook con registry Docker
- [[useDockerFileSystem.ts]] — Estado de containers/images

## Decisiones Relevantes
- Ver [[decisions/ADR-002-docker-simulation.md]] — Por qué no usamos Docker real

## Advertencias y Casos de Borde
- ⚠️ Imágenes grandes tardan "simulado" tiempo en pull (experiencia realista)
- ⚠️ Logs son generados aleatoriamente, no reflejan actividad real
- ⚠️ `docker build` simula el proceso sin analizar Dockerfile real
- ⚠️ Networking entre contenedores no está implementada
- ⚠️ Volúmenes persisten datos simulados, no comparten con filesystem real
