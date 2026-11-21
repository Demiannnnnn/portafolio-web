# Portfolio

Portafolio Demian Maturana.

> **Estado:** esqueleto inicial. Esta rama contiene solo la estructura de carpetas,
> los diagramas de diseño y Dockerfiles/compose de marcador de posición. Todavía no
> hay código de aplicación, dependencias ni comandos de build o tests.

## Arquitectura planeada

Según los diagramas de `documentation/infrastructure/`:

- **Proxy:** nginx, sirve el frontend y enruta al backend.
- **Frontend:** React + TypeScript + Vite (`frontend/`).
- **Backend:** Rust + Axum (`backend/`).
- **Base de datos:** PostgreSQL.
- **Despliegue:** Docker Compose detrás de Cloudflare.

## Estructura

```
backend/        Backend (Rust/Axum): Dockerfile y carpetas src/config, src/middlewares, src/shared
frontend/       Frontend (React/TS/Vite): Dockerfile y carpetas de src/ (components, features, hooks...)
documentation/  Diagramas entidad-relación e infraestructura (Lucidchart: JSON, PDF, PNG)
docker-compose.yml  Orquestación de servicios (vacío por ahora)
```

Cada carpeta de `src/` tiene un `README.md` que describe su propósito.

## Configuración

Los secretos (credenciales de base de datos, etc.) se entregan solo por variables de
entorno o archivos ignorados por git (`.env`, `secrets/`). Nunca se versionan.
