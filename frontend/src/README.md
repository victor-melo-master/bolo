# `frontend/src/` — Código fuente del Frontend (React + TypeScript + Vite)

Directorio raíz del frontend del proyecto **BOLO**. Contiene toda la lógica de presentación, estado global, enrutamiento y comunicación con la API.

## Estructura general

```
src/
├── api/           Cliente HTTP para comunicación con el backend
├── assets/        Recursos estáticos (imágenes, iconos SVG, fuentes)
├── modules/       Módulos funcionales (auth, dashboard)
├── pages/         Componentes de página (vistas completas)
├── routes/        Configuración del enrutador (React Router)
├── shared/        Código compartido entre módulos (store, guards, componentes, tipos, utilidades)
├── App.tsx        Punto de entrada del componente raíz
├── App.css        Estilos globales de la aplicación
├── main.tsx       Punto de entrada de Vite (renderiza App en #root)
└── index.css      Estilos base/reset del documento
```

## Archivos principales

### `main.tsx` — Punto de entrada

Renderiza el componente `<App />` dentro de `<StrictMode>` sobre el elemento DOM `#root`:

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);
```

### `App.tsx` — Componente raíz

Componente más simple posible: delega todo el enrutamiento a `AppRouter`:

```tsx
export default function App() {
  return <AppRouter />;
}
```

### `api/` — Cliente HTTP

Archivo único `client.ts` que exporta:

- **`apiClient<T>(endpoint, options)`** — Función genérica que envía peticiones `fetch` con:
  - Base URL desde `VITE_API_URL` (variable de entorno)
  - Token JWT inyectado automáticamente desde el store de Zustand (`useAuthStore`)
  - Cabecera `Content-Type: application/json`
  - Manejo de errores unificado mediante la clase `ApiError`
- **`ApiError`** — Clase de error personalizada con campo `status` para códigos HTTP

### `routes/` — Enrutamiento

Archivo `AppRouter.tsx` que define todas las rutas de la aplicación usando `createBrowserRouter`:

| Ruta | Componente | Protegida | Rol requerido |
|---|---|---|---|
| `/` | `HomePage` | No | — |
| `/login` | `PassengerLoginPage` | No | — |
| `/admin/login` | `AdminLoginPage` | No | — |
| `/register` | `RegisterPage` | No | — |
| `/dashboard` | `DashboardPage` | Sí | Cualquiera |
| `/profile` | `ProfilePage` | Sí | Cualquiera |
| `/profile/password` | `PasswordChangePage` | Sí | Cualquiera |
| `/admin/create` | `AdminCreatePage` | Sí | `super_admin` |
| `/unauthorized` | `UnauthorizedPage` | No | — |
| `*` | `NotFoundPage` | No | — |

### `assets/` — Recursos estáticos

Contiene imágenes como `hero.png`, `react.svg` y `vite.svg`.

## Patrón de módulos

El frontend organiza la lógica de negocio en **módulos autocontenidos** dentro de `modules/`. Cada módulo agrupa:

- **`components/`** — Componentes de UI específicos del módulo
- **`hooks/`** — Hooks personalizados con lógica de estado y llamadas a la API
- **`services/`** — Funciones que encapsulan las peticiones HTTP
- **`types/`** — Interfaces y tipos TypeScript del módulo
- **`utils/`** — Utilidades y esquemas de validación (Zod)

## Dependencias

- **React 19** con TypeScript
- **React Router v7** para enrutamiento SPA
- **Zustand** con `persist` para el store global de autenticación
- **React Hook Form** + **Zod** para validación de formularios
- **Vite** como empaquetador y servidor de desarrollo

## Conexión con el resto del proyecto

- El frontend se comunica con el **middleware** (Go Fiber) a través de `VITE_API_URL`
- El middleware actúa como proxy de seguridad hacia la **API** (NestJS)
- Los servicios del backend usan **PostgreSQL** y **Redis** como almacenes de datos
