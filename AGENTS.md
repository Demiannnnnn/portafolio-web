# AGENTS.md — portafolio-web

Guía para agentes y colaboradores. Respétala antes de modificar el repositorio.

## Propósito

Portafolio web personal de Demian Maturana. Hoy la rama `develop` es un **esqueleto**:
estructura de carpetas, diagramas de diseño y Dockerfiles/compose de marcador de posición.
No hay código de aplicación todavía.

## Stack (planeado, según `documentation/infrastructure/`)

- Proxy: nginx (sirve el frontend y enruta al backend).
- Frontend: React + TypeScript + Vite.
- Backend: Rust + Axum.
- Base de datos: PostgreSQL.
- Despliegue: Docker Compose, detrás de Cloudflare.

## Estructura

```
backend/
  Dockerfile            marcador de posición (FROM baseImage)
  src/config/           configuración global del backend
  src/middlewares/      middlewares
  src/shared/           código compartido entre módulos
frontend/
  Dockerfile            marcador de posición (FROM baseImage)
  src/{assets,components,config,context,features,hooks,layouts,routes,services,types,utils}/
documentation/
  entityRelationship/   diagrama ER (JSON de Lucidchart, PDF, PNG)
  infrastructure/       diagrama de infraestructura (JSON, PDF, PNG)
docker-compose.yml      vacío por ahora
```

Cada carpeta de `src/` tiene un `README.md` que explica su propósito; mantenlo al día.

## Instalar, correr, testear, lintear

Todavía **no existen** `package.json`, `Cargo.toml` ni servicios en compose, así que no hay
comandos de instalación, build, tests ni lint. Comprobaciones disponibles hoy (ambas fallan
porque los archivos son marcadores de posición):

```sh
docker compose -f docker-compose.yml config   # falla: "empty compose file"
docker build --check backend                  # falla: imagen base "baseImage" inválida
docker build --check frontend                 # ídem
```

Cuando se agregue código, actualiza esta sección con los comandos reales, por ejemplo:

- Frontend: `cd frontend && npm ci && npm run dev | npm test | npm run lint | npm run build`
- Backend: `cd backend && cargo run | cargo test | cargo clippy -- -D warnings | cargo fmt --check`

## Convenciones de código

- Código, nombres de archivos y mensajes de commit en inglés; documentación puede ir en español.
- Commits convencionales: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `build:`.
- Commits pequeños y enfocados; sin refactors grandes mezclados con fixes.
- Frontend: TypeScript estricto, componentes en `components/`, páginas en `features/`.
- Backend: `cargo fmt` y `cargo clippy` sin warnings.
- No versionar artefactos (`target/`, `node_modules/`, `dist/`, `build/`); ver `.gitignore`.
- Los diagramas (PDF/PNG/JSON) de `documentation/` son entregables intencionales: no borrarlos.

## Seguridad

- Secretos **solo** por variables de entorno (`process.env` / `import.meta.env` en el
  frontend, `std::env::var` en Rust, `${VAR}` en compose) o archivos montados como secrets.
- `.env` **nunca** se versiona; documenta cada variable en `.env.example` con el
  placeholder `CHANGE_ME` y una explicación.
- No versionar `*.pem`, `*.key`, `credentials*.json`, `token*.txt`, `secrets/` ni
  manifiestos `k8s/*-secret.yaml`: los Secrets de Kubernetes se generan desde el entorno, p. ej.
  `kubectl create secret generic db-password --from-literal=db-password="$DB_PASSWORD"`.
- Si un secreto llega a un commit, considéralo comprometido: rótalo y avisa para purgar la historia.

## Flujo git

- Trabaja en ramas `dev/*` y abre PR hacia `develop-AGENTS`.
- Nunca hagas commit ni push directo a `main` ni a `develop`.
- No reescribas historia compartida (`rebase`, `push --force`, `filter-repo`) sin acuerdo explícito.
