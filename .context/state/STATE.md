---
tipo: estado
ultima_sincronizacion: 2025-04-27
---

# Estado del Proyecto — Terminal Playground

**Versión semántica:** v0.0.0 — MVP funcional con Linux y Docker

---

## ✅ Última Tarea Completada
Implementación de sistema de comandos Docker (12 comandos) y tutoriales Docker (10 lecciones) — 2025-04-27

---

## 🚧 En Progreso
Nada actualmente. Wiki LLM recién inicializada.

---

## 📋 Próximos Pasos (ordenados por prioridad)

1. **Expandir comandos Linux** — Añadir `awk`, `sed` avanzado, `rsync` básico
2. **Tutorial interactivo mejorado** — Validación de output esperado, no solo comando
3. **Persistencia de filesystem** — Opción de guardar/cargar estado del FS
4. **Temas visuales** — Alternar entre temas de terminal (green phosphor, amber, etc.)
5. **Exportar comandos ejecutados** — Generar script `.sh` con historial
6. **Pruebas unitarias** — Cobertura para comandos críticos (`ls`, `cd`, `grep`)

---

## 🐛 Bugs Abiertos
- [ ] `docker run` sin `-d` debería mantener foreground simulado — Prioridad: Media — Archivo: [[DockerTerminal.tsx]]
- [ ] `tail -f` no simula follow real (output estático) — Prioridad: Baja — Archivo: [[tail.ts]]
- [ ] `vim` no implementa modos ni comandos internos — Prioridad: Baja — Archivo: [[vim.ts]]

---

## 💸 Deuda Técnica
- [ ] Comandos de red (`curl`, `wget`) tienen URLs mockeadas hardcodeadas — Prioridad: Media
- [ ] No hay sistema de autenticación para `ssh` (acepta cualquier input) — Prioridad: Baja
- [ ] Colores en `ls` no respetan variable `LS_COLORS` — Prioridad: Baja

---

## ⚡ Discrepancias Detectadas
- Ninguna detectada en esta sincronización inicial.

---

## Estados de Tareas

| Tarea | Estado | Icono |
|:---|:---|:---:|
| Wiki LLM inicializada | ✅ COMPLETADO | ✅ |
| Comandos Linux (50+) | ✅ COMPLETADO | ✅ |
| Comandos Docker (12+) | ✅ COMPLETADO | ✅ |
| Tutoriales Linux (15+) | ✅ COMPLETADO | ✅ |
| Tutoriales Docker (10+) | ✅ COMPLETADO | ✅ |
| Sistema de logros | ✅ COMPLETADO | ✅ |
| Filesystem virtual | ✅ COMPLETADO | ✅ |
| Streak diario | ✅ COMPLETADO | ✅ |
