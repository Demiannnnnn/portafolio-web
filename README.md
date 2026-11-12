# Portafolio web — Demian Maturana

Portafolio personal: una página en React que presenta proyectos, infraestructura y un formulario de contacto, con un backend en Rust que recibe los mensajes de contacto y registra visitantes anónimos en PostgreSQL.

## Arquitectura

```text
navegador ──► proxy (nginx) ──┬── /api/* ──► backend (Rust, axum) ──► PostgreSQL 15
                              └── /*     ──► frontend (nginx con el build de Vite)
```

| Pieza | Carpeta | Tecnología |
|---|---|---|
| Frontend | `frontend/` | React 19, TypeScript, Vite, framer-motion, three.js. Se compila a estáticos y se sirve con nginx (`frontend/nginx.conf`, fallback a `index.html`). |
| Backend | `backend/` | Rust (edición 2024), axum 0.8, tokio, tokio-postgres. Escucha en `0.0.0.0:8000` y expone las rutas bajo `/api`. |
| Proxy | `proxy/` | nginx: enruta `/api/` al backend y el resto al frontend, y añade `X-Forwarded-For` / `X-Real-IP`. |
| Base de datos | `backend/migrations/init.sql` | PostgreSQL 15; el script se ejecuta al crear el volumen en Docker Compose. |

### Rutas del backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/ping` | Comprobación de salud (`pong`). |
| POST | `/api/contact` | Guarda un mensaje de contacto. |
| GET | `/api/contacts` | Lista los mensajes de contacto. |
| POST | `/api/visitors/register` | Registra un visitante anónimo (IP con hash) y devuelve un token de sesión. |
| GET | `/api/visitors/current` | Devuelve el visitante de la cabecera `x-session-token`. |

Los módulos `ai`, `infrastructure` y `security` de `backend/src/modules` todavía están vacíos. Los mensajes de contacto se guardan en memoria (se pierden al reiniciar); los visitantes sí van a PostgreSQL.

## Estructura

```text
backend/        API en Rust (src/modules/<módulo>/{routes,controller,service,repository,model}.rs)
frontend/       SPA en React + Vite
proxy/          nginx de entrada
k8s/            manifiestos generados con kompose a partir de compose.yaml
documentation/  diagramas (entidad-relación e infraestructura)
compose.yaml    entorno completo con Docker Compose
```

## Cómo correrlo

### Con Docker Compose

1. Copia `.env.example` a `.env` y rellena los puertos que usa `compose.yaml` (`proxy_port`, `proxy_container_port`, `frontend_port`, `frontend_container_port`, `backend_port`, `backend_container_port`, `db_port`, `db_container_port`).
2. Crea tres archivos con el usuario, la contraseña y el nombre de la base de datos, y apunta a ellos con `db_user`, `db_password` y `db_name` en `.env` (Compose los monta como *secrets*).
3. Arranca:

   ```bash
   docker compose up --build
   ```

   La web queda en `http://localhost:<proxy_port>`.

### Por separado

Backend (necesita un PostgreSQL accesible):

```bash
cd backend
export DATABASE_HOST=localhost DATABASE_PORT=5432
export DATABASE_USER_FILE=/ruta/db_user DATABASE_PASSWORD_FILE=/ruta/db_password DATABASE_NAME_FILE=/ruta/db_name
cargo run
```

Frontend (Node 22 o superior, lo exigen Vite 8 y jsdom):

```bash
cd frontend
npm ci
npm run dev
```

## Variables de entorno del backend

| Variable | Por defecto | Uso |
|---|---|---|
| `DATABASE_HOST` / `DATABASE_PORT` | `database` / `5432` | Servidor PostgreSQL. |
| `DATABASE_USER_FILE`, `DATABASE_PASSWORD_FILE`, `DATABASE_NAME_FILE` | — | Rutas a archivos con las credenciales. |
| `TRUSTED_PROXY_COUNT` | `0` | Número de proxies de confianza delante del backend. Ver abajo. |
| `TRUST_CF_CONNECTING_IP` | `false` | Usar la cabecera `CF-Connecting-IP`. Solo si todo el tráfico entra por Cloudflare. |

**IP del visitante.** Cada proxy añade al final de `X-Forwarded-For` la IP que vio; lo que esté más a la izquierda lo puede escribir el propio cliente. Por eso el backend toma la entrada N-ésima contando desde la derecha, con N = `TRUSTED_PROXY_COUNT`:

- `0`: se ignoran `X-Forwarded-For` y `X-Real-IP` y se usa la IP de la conexión TCP (valor seguro, pero detrás de un proxy todos los visitantes tendrán la IP del proxy).
- `1`: detrás solo del nginx de `proxy/` (Docker Compose).
- `2`: el nginx de `proxy/` detrás de otro proxy que también añade su entrada (por ejemplo un ingress-nginx en Kubernetes).

## Tests y lint

```bash
cd backend && cargo test
cd frontend && npm test && npm run lint && npm run build
```

- Backend: tests unitarios del servicio y repositorio de contacto, modelos, hash de IP y resolución de la IP del cliente.
- Frontend: Vitest + Testing Library (cliente de la API, formulario de contacto, tarjeta y slider de proyectos).

## CI

`.github/workflows/ci.yml` se ejecuta en cada push y pull request:

- **backend**: `cargo build --locked` y `cargo test --locked` con Rust estable.
- **frontend**: Node 24, `npm ci`, `npm test`, `npm run build` y `npm run lint`. El lint hace fallar el CI.

No hay despliegue automático.

## Despliegue en Kubernetes

- `k8s/` contiene la traducción de `compose.yaml` hecha con `kompose convert` (Deployments, Services, PVC y Secrets de la base de datos); usa imágenes locales (`imagePullPolicy: Never`).
- La infraestructura del cluster se mantiene en [kubernetes-infra](https://github.com/Demiannnnnn/kubernetes-infra): este proyecto vive en `apps/portfolio` (base con backend y PostgreSQL en StatefulSet, overlays `dev` y `prod`) dentro del tenant `portfolio`.
