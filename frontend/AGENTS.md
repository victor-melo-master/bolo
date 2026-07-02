# AGENTS — Frontend (React 19 + Vite 8)

## Stack
React 19 · TypeScript 6 · Vite 8 · React Router 7 · Zustand 5 · React Hook Form 7 · Zod 4

## Estado
🔄 Parcial — auth module funcional (login, register, profile, CRUD), dashboard stub, pages/ en construcción.

## Arquitectura
```
frontend/src/
├── api/               Cliente HTTP genérico (fetch + JWT)
├── modules/           Feature modules (auth)
│   └── auth/          Components, hooks, services, types, utils
├── pages/             Page components por sección
│   ├── auth/          PassengerLogin, AdminLogin, Register
│   ├── admin/         AdminCreate
│   ├── dashboard/     DashboardPage (stub)
│   ├── profile/       ProfilePage, PasswordChangePage
│   └── error/         NotFoundPage, UnauthorizedPage
├── routes/            AppRouter (createBrowserRouter)
└── shared/            Guards, store, types, utils, components
```

## Routing
```tsx
/                  → HomePage
/login             → PassengerLoginPage
/admin/login       → AdminLoginPage
/register          → RegisterPage
/dashboard         → ProtectedRoute → DashboardPage
/profile           → ProtectedRoute → ProfilePage
/profile/password  → ProtectedRoute → PasswordChangePage
/admin/create      → ProtectedRoute(role:super_admin) → AdminCreatePage
```

## State Management
- **Zustand** (`shared/store/authStore.ts`) — token, user, login/logout actions
- Token se lee directo del store (sin React) en `api/client.ts`

## API Client
- `api/client.ts` → `apiClient<T>(endpoint, options)` con:
  - Inyección automática de `Authorization: Bearer <token>`
  - Serialización JSON
  - Manejo centralizado de errores (`ApiError` class)
  - Soporte AbortSignal

## Auth Module
| Componente | Propósito |
|-----------|-----------|
| LoginForm | Login con teléfono + contraseña |
| RegisterPassengerForm | Registro pasajero |
| RegisterAdminForm | Registro administrador |
| ProfileForm | Actualización perfil |
| PasswordChangeForm | Cambio contraseña |
| CreateAdminForm | Crear admin (solo super_admin) |

Hooks: `useLogin`, `useRegisterPassenger`, `useCreateAdmin`, `useProfile`, `useUpdateProfile`, `useChangePassword`, `useDeleteAccount`

## Variables de entorno
```env
VITE_API_URL=http://localhost:8080/api   # apunta al middleware, no directo a la API
VITE_ENVIRONMENT=development
```

## Comandos
```bash
npm run dev      # Vite dev server (hot reload)
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview  # Vite preview (serve built files)
```

## Convenciones
- Páginas en `pages/` organizadas por ruta
- Lógica de negocio en `modules/{feature}/hooks/`
- API calls en `modules/{feature}/services/`
- Estado global en `shared/store/`
- Tipos compartidos en `shared/types/`

## Producción
- Build estático servido por Nginx 1.27 Alpine (`nginx.conf` con SPA routing)
- Solo red `public_net` — no tiene acceso directo a API, Redis ni PostgreSQL
