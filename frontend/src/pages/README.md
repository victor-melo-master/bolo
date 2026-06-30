# `pages/` — Páginas de la aplicación

Cada archivo o subdirectorio representa una **ruta completa** de la aplicación. Las páginas importan hooks y componentes de `modules/` para construir la vista final.

## Estructura

```
pages/
├── HomePage.tsx                 Página de inicio con selector de acceso
├── NotFoundPage.tsx             404 — Ruta no encontrada
├── auth/                        Páginas de autenticación
│   ├── LoginPage.tsx            (placeholder / obsoleto)
│   ├── PassengerLoginPage.tsx   Login para pasajeros
│   ├── AdminLoginPage.tsx       Login para administradores
│   └── RegisterPage.tsx         Registro de nuevos pasajeros
├── dashboard/
│   └── DashboardPage.tsx        Panel de control principal
├── profile/
│   ├── ProfilePage.tsx          Edición de perfil
│   └── PasswordChangePage.tsx   Cambio de contraseña
├── admin/
│   └── AdminCreatePage.tsx      Creación de admins (solo super_admin)
├── error/
│   ├── UnauthorizedPage.tsx     403 — Acceso denegado
│   └── NotFoundPage.tsx         404 — Página no encontrada
└── passangers/                  (vacío — pendiente)
```

## Descripción de páginas

### `HomePage.tsx` — Ruta: `/`

Página de bienvenida que presenta dos opciones de acceso:
- **"Soy Pasajero"** → enlace a `/login`
- **"Soy Administrador"** → enlace a `/admin/login`

### `auth/` — Rutas de autenticación

| Archivo | Ruta | Propósito |
|---|---|---|
| `LoginPage.tsx` | — | Componente placeholder simple (`<div>Login</div>`) |
| `PassengerLoginPage.tsx` | `/login` | Login de pasajero. Usa `useLogin("passenger")` y `LoginForm`. Redirige a `/dashboard` |
| `AdminLoginPage.tsx` | `/admin/login` | Login de administrador. Usa `useLogin("admin")` y `LoginForm`. Redirige a `/dashboard` |
| `RegisterPage.tsx` | `/register` | Registro de pasajero. Usa `useRegisterPassenger()` y `RegisterPassengerForm`. Redirige a `/dashboard` |

### `dashboard/DashboardPage.tsx` — Ruta: `/dashboard` (protegida)

Panel de control principal. Muestra:
- Datos del perfil del usuario autenticado (nombre, teléfono, email, rol/categoría)
- Enlaces a: editar perfil, cambiar contraseña, crear admin (solo `super_admin`)
- Botón de cerrar sesión que redirige a `/`

### `profile/` — Rutas de perfil (protegidas)

| Archivo | Ruta | Propósito |
|---|---|---|
| `ProfilePage.tsx` | `/profile` | Edición de perfil. Precarga datos con `useProfile()`. Usa `ProfileForm` |
| `PasswordChangePage.tsx` | `/profile/password` | Cambio de contraseña. Usa `useChangePassword()` y `PasswordChangeForm` |

### `admin/AdminCreatePage.tsx` — Ruta: `/admin/create` (protegida, solo super_admin)

Formulario para crear nuevos administradores o conductores. Usa `useCreateAdmin()` y `CreateAdminForm`.

### `error/` — Rutas de error

| Archivo | Ruta | Propósito |
|---|---|---|
| `UnauthorizedPage.tsx` | `/unauthorized` | Muestra mensaje de acceso denegado |
| `NotFoundPage.tsx` | `*` (404) | Muestra mensaje de página no encontrada |

## Patrón de implementación

Cada página sigue la misma estructura:

```tsx
export default function SomePage() {
  const { execute, isLoading, error } = useSomeHook();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await execute(data);
      navigate('/success-route', { replace: true });
    } catch { /* error manejado en el hook */ }
  };

  return (
    <div>
      <h1>Título de la página</h1>
      <SomeForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
      <Link to="/">← Volver</Link>
    </div>
  );
}
```

## Dependencias

- Todas las páginas importan hooks de `modules/auth/hooks/`
- Los formularios vienen de `modules/auth/components/`
- El enrutamiento se define en `routes/AppRouter.tsx`
- `DashboardPage` usa `shared/store/authStore` directamente
