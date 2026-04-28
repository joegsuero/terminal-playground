---
tipo: decision
status: activo
fecha: 2025-04-27
---

# ADR-002: Simulación de Docker vs Docker Real

## Contexto
La app corre en GitHub Pages (static hosting) sin backend. Para soportar Docker teníamos dos opciones: integrar Docker real via API o simular el comportamiento.

## Decisión
Simular completamente Docker CLI con entidades virtuales en memoria. No hay conexión a Docker daemon ni API.

## Razón
- **Seguridad**: Docker requiere privilegios de root; inseguro en browser
- **Deploy**: GH Pages solo soporta static files; no puede correr Docker
- **Simplicidad**: Elimina dependencia de infraestructura
- **Portabilidad**: Funciona offline y en cualquier navegador

## Alternativas Consideradas
- **Docker via WebAssembly**: experimental, bundle muy grande, poco soporte
- **API externa de Docker**: requiere backend, costo, latencia, CORS
- **Play-with-Docker integración**: dependencia externa, no offline

## Consecuencias
- ✅ Zero infraestructura, deploy inmediato
- ✅ 100% seguro (no ejecuta nada real)
- ✅ Funciona offline
- ⚠️ Comportamiento no 100% idéntico a Docker real
- ⚠️ Limitaciones (networking, builds reales, etc.)

## Qué se Rompe Si se Ignora Esta Decisión
- Imposibilidad de deploy en GH Pages
- Riesgo de seguridad si se intenta exponer Docker socket
- Complejidad innecesaria para propósito educativo básico

## Notas para Contribuidores
- Agregar nuevos comandos Docker no requiere Docker instalado localmente
- Las imágenes "descargadas" son mera simulación; no hay binarios reales
- Los logs son generados; no hay procesos reales corriendo
