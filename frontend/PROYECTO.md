# Frontend — React + Vite + TypeScript

## Descripción General

Panel de administración web de BOLO. Interfaz de usuario construida con **React 19** y **Vite 8** para el ecosistema de transporte: gestión de pasajeros, conductores, cooperativas, rutas, vehículos, viajes activos, historial de pagos, reportes financieros y configuración del sistema.

Se comunica exclusivamente con el **middleware** (Go Fiber) a través de la variable `VITE_API_URL`. Nunca accede directamente a la API, Redis ni PostgreSQL. En desarrollo corre con Hot Module Replacement (HMR); en producción los archivos estáticos se sirven con **Nginx 1.27**.

## Estructura de Archivos

```
frontend/
├── .gitignore               # Archivos ignorados (node_modules, dist)
├── Dockerfile               # Multi-stage: development / build / production
├── eslint.config.js         # ESLint flat config con React Hooks + React Refresh
├── index.html               # Punto de entrada HTML
├── nginx.conf               # Configuración de Nginx para producción
├── package.json             # Dependencias y scripts
├── package-lock.json        # Lockfile de npm
├── tsconfig.json            # TypeScript configuración raíz (references)
├── tsconfig.app.json        # TypeScript configuración para la app
├── tsconfig.node.json       # TypeScript configuración para vite.config
├── vite.config.ts           # Configuración de Vite
├── public/                  # Archivos estáticos (favicon, imágenes)
└── src/                     # Código fuente React
    ├── main.tsx             # Punto de entrada React
    ├── App.tsx              # Componente raíz
    ├── App.css              # Estilos globales
    ├── index.css            # Estilos base
    ├── vite-env.d.ts        # Tipos de Vite
    └── ...                  # Componentes, hooks, páginas, etc.
```

## Stack Tecnológico

| Componente          | Versión  | Propósito                               |
|---------------------|----------|-----------------------------------------|
| React               | ^19.2    | Biblioteca de UI                        |
| React DOM           | ^19.2    | Renderizado DOM                         |
| Vite                | ^8.0     | Bundler y dev server con HMR            |
| TypeScript          | ~6.0     | Lenguaje                                |
| @vitejs/plugin-react| ^6.0     | Plugin Vite para React (Oxc)            |
| ESLint              | ^10.3    | Linting                                 |
| Nginx               | 1.27-alpine | Servidor HTTP para producción        |

## Despliegue — Paso a Paso

### En Desarrollo (HMR con Docker Compose)

```bash
# 1. Desde la raíz, levanta todo el stack (incluye frontend con hot-reload)
make up

# 2. Abre en el navegador
# http://localhost:5173
```

Vite se inicia con `npx vite --host 0.0.0.0 --port 5173`. El flag `--host 0.0.0.0` es necesario para que el servidor de desarrollo sea accesible desde fuera del contenedor. Los cambios en `./frontend/` se reflejan al instante gracias al volumen montado en `delegated` mode.

### En Desarrollo Local (sin Docker)

```bash
cd frontend
npm install
npm run dev        # Inicia Vite en localhost:5173
npm run build      # Compila para producción
npm run preview    # Sirve el build localmente
```

### En Producción

El stage `production` del Dockerfile construye los assets estáticos con Vite y los sirve con Nginx:

```bash
docker build --target production -t bolo-frontend:latest .
```

Características de la imagen de producción:
- Basada en `nginx:1.27-alpine`
- Copia `dist/` (build de Vite) a `/usr/share/nginx/html`
- Usa `nginx.conf` personalizado con soporte SPA (fallback a `index.html`)
- Corre como usuario `bolo:bolo` sin privilegios
- Escucha en el puerto 8080 (privilegiado → se mapea a 80 externamente)

## Variables de Entorno

| Variable           | Requerida | Default                    | Descripción                              |
|--------------------|-----------|----------------------------|------------------------------------------|
| VITE_API_URL       | No        | http://localhost:8080       | URL base del middleware (Go Fiber)        |
| VITE_ENVIRONMENT   | No        | development                | Entorno (development/production)         |

**Importante:** Las variables Vite_ se inyectan en **tiempo de compilación** (no en runtime). Si cambian, hay que reconstruir la imagen.

## nginx.conf

```nginx
server {
    listen 8080;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;  # SPA routing: React maneja las rutas
    }
}
```

El bloque `try_files $uri $uri/ /index.html` es vital para que React Router funcione correctamente: cualquier ruta que no sea un archivo físico (ej: `/dashboard/usuarios`) redirige a `index.html`.

## Dependencias entre Servicios

```
postgres ──→ api ──→ middleware (healthy) ──→ frontend
```

El frontend espera a que el middleware esté saludable antes de arrancar.

## Redes

| Red          | Tipo    | Acceso                          |
|--------------|---------|---------------------------------|
| `public_net` | bridge  | Frontend ↔ Middleware (tráfico web) |

El frontend **no tiene acceso** a la API, Redis, PostgreSQL ni ninguna otra red interna. Toda la comunicación con el backend pasa obligatoriamente por el middleware.

## Healthcheck

```yaml
test: ["CMD-SHELL", "curl -f http://localhost:5173 || exit 1"]
interval: 10s
timeout: 5s
retries: 5
start_period: 30s
```

## Puertos

| Entorno     | Puerto | Servidor         |
|-------------|--------|------------------|
| Desarrollo  | 5173   | Vite Dev Server  |
| Producción  | 80     | Nginx            |

## Comandos Útiles

```bash
npm run dev       # Inicia servidor de desarrollo Vite (HMR)
npm run build     # Compila para producción (tsc + vite build)
npm run preview   # Sirve el build localmente
npm run lint      # ESLint
```

## Notas de Seguridad

- En producción, Nginx corre como usuario `bolo:bolo` sin privilegios de root.
- El contenedor no tiene shell ni herramientas de depuración.
- No se expone ningún puerto de la API al frontend directamente.
- Las variables sensibles (API keys, tokens) nunca deben estar en el frontend — se manejan desde el middleware.
