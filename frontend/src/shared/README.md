# `shared/` — Código compartido entre módulos

Directorio que contiene utilidades, componentes y estado global reutilizables por todos los módulos y páginas del frontend.

## Estructura

```
shared/
├── store/         Estado global (Zustand)
├── guards/        Protectores de ruta (React Router)
├── components/    Componentes UI reutilizables
├── context/       Contextos de React (pendiente)
├── hooks/         Hooks genéricos (pendiente)
├── types/         Tipos compartidos
└── utils/         Utilidades generales
```

## `store/` — Estado global con Zustand

### `authStore.ts`

Store de autenticación persistente mediante `zustand/middleware/persist`. Almacena en `localStorage` bajo la clave `auth-storage`.

**Estado:**
- `token: string | null` — JWT de acceso
- `user: UserProfile | null` — Perfil del usuario autenticado

**Métodos:**
| Método | Descripción |
|---|---|
| `login(token, user)` | Establece token y usuario |
| `logout()` | Limpia token y usuario |
| `setUser(user)` | Actualiza solo el perfil |
| `userType()` | Retorna `'admin'` o `'passenger'` según el rol del usuario |

El store se usa desde cualquier lugar sin necesidad de un Provider gracias a Zustand.

## `guards/` — Protección de rutas

### `ProtectedRoute.tsx`

Componente que envuelve rutas protegidas en `AppRouter`. Verifica:

1. **Autenticación**: si no hay `token`, redirige a `"/"`
2. **Roles**: si se especifica `requiredRole`, verifica que el usuario sea admin y tenga el rol exacto. En caso contrario, redirige a `"/unauthorized"`

Uso en el router:
```tsx
{
  element: <ProtectedRoute requiredRole="super_admin" />,
  children: [
    { path: 'admin/create', element: <AdminCreatePage /> },
  ],
}
```

## `components/` — Componentes UI compartidos

### `EyeIcon.tsx`

Componente SVG de icono de ojo (abierto/cerrado) para toggles de visibilidad de contraseña. Props:

- `open: boolean` — `true` muestra el ojo abierto (texto visible), `false` muestra el ojo tachado
- `size?: number` — Tamaño en píxeles (default: 20)

Usado por: `RegisterPassengerForm`, `LoginForm`, `PasswordChangeForm`, `CreateAdminForm`

## `types/` — Tipos compartidos

### `api.ts`

Actualmente vacío — preparado para alojar tipos genéricos de API (respuestas paginadas, envelopes, etc.)

## `utils/` — Utilidades generales

### `storage.ts`

Funciones helper para manejo del token en `localStorage`:
- `setToken(token)` — Guarda el token
- `getToken()` — Recupera el token
- `removeToken()` — Elimina el token

Actualmente estas funciones no se usan directamente (el store de Zustand maneja la persistencia), pero están disponibles para migraciones o compatibilidad.

## `context/` y `hooks/`

Directorios preparados para futuros contextos de React y hooks genéricos respectivamente. Actualmente están vacíos.

## Relaciones con otras partes

```
                  ┌──────────────────┐
                  │   pages/         │
                  │   (vistas)       │
                  └───────┬──────────┘
                          │ usa
                    ┌─────▼──────┐
                    │  modules/  │
                    │ (hooks)    │
                    └─────┬──────┘
                          │ consume
              ┌───────────┼───────────┐
              │           │           │
        ┌─────▼────┐ ┌───▼───┐ ┌───▼──────┐
        │ store/   │ │ types/ │ │ guards/  │
        │ Zustand  │ │ comp.  │ │ Protected│
        │ auth     │ │ shared │ │ Route    │
        └──────────┘ └───────┘ └──────────┘
```
