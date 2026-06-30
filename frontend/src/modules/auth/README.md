# `modules/auth/` — Módulo de autenticación y usuarios

Gestiona toda la funcionalidad relacionada con identidad: inicio de sesión, registro, perfiles, cambio de contraseña y creación de administradores.

## Estructura

```
auth/
├── components/    Formularios reutilizables
├── hooks/         Hooks de estado con lógica de negocio
├── services/      Capa de comunicación HTTP
├── types/         Interfaces y tipos TypeScript
└── utils/         Validación Zod y utilidades
```

## `components/` — Formularios

| Archivo | Propósito |
|---|---|
| `LoginForm.tsx` | Formulario de inicio de sesión (teléfono + contraseña). Valida con `loginSchema` |
| `RegisterPassengerForm.tsx` | Registro completo de pasajero: nombre, teléfono, contraseña, email, cédula, categoría. Incluye toggle de visibilidad y botón deshabilitado hasta validar |
| `ProfileForm.tsx` | Edición de perfil con datos precargados. Adapta campos según tipo de usuario (admin vs pasajero) |
| `PasswordChangeForm.tsx` | Tres campos (actual, nueva, confirmación) con toggles individuales y validación de coincidencia |
| `CreateAdminForm.tsx` | Creación de administradores/conductores. Solo visible para `super_admin`. Incluye selector de rol |
| `RegisterAdminForm.tsx` | Pendiente de implementación |

Todos los formularios usan **React Hook Form** con **Zod** para validación y reciben props `onSubmit`, `isLoading`, `error`.

## `hooks/` — Lógica de estado

| Hook | Descripción |
|---|---|
| `useLogin.ts` | Ejecuta login de pasajero o admin según `UserType`. Guarda token y usuario en el store de Zustand |
| `useRegisterPassenger.ts` | Registra un nuevo pasajero. Llama a `registerPassenger` y persiste la sesión |
| `useProfile.ts` | Obtiene el perfil del usuario autenticado. Determina automáticamente si es admin o pasajero |
| `useUpdateProfile.ts` | Actualiza perfil (nombre, email, cédula, categoría). Refresca el store |
| `useChangePassword.ts` | Cambia contraseña. Detecta tipo de usuario para llamar al endpoint correcto |
| `useCreateAdmin.ts` | Crea un nuevo admin. Solo ejecutable por `super_admin` |
| `useDeleteAccount.ts` | Vacío — pendiente de implementación |

Cada hook sigue el patrón: `{ execute, isLoading, error }` (y opcionalmente `success`).

## `services/` — API

`authApi.ts` define funciones para cada endpoint divididas en dos grupos:

**Pasajero:**
- `registerPassenger(data)` → `POST /auth/passenger/register`
- `loginPassenger(data)` → `POST /auth/passenger/login`
- `getPassengerProfile()` → `GET /auth/passenger/profile`
- `updatePassengerProfile(data)` → `PUT /auth/passenger/profile`
- `changePassengerPassword(data)` → `PUT /auth/passenger/password`
- `deletePassengerAccount()` → `DELETE /auth/passenger/profile`

**Admin:**
- `loginAdmin(data)` → `POST /auth/admin/login`
- `createAdmin(data)` → `POST /auth/admin/create`
- `getAdminProfile()` → `GET /auth/admin/profile`
- `updateAdminProfile(data)` → `PUT /auth/admin/profile`
- `changeAdminPassword(data)` → `PUT /auth/admin/password`
- `deleteAdminAccount()` → `DELETE /auth/admin/profile`

Todas las funciones usan `apiClient<T>()` del directorio `api/`.

## `types/` — Interfaces

`index.ts` define:

- **`PassengerProfile`** / **`AdminProfile`** / **`UserProfile`** — Perfiles de usuario (unión discriminada)
- **`LoginRequest`** / **`LoginResponse`** — Payload y respuesta de inicio de sesión
- **`RegisterPassengerRequest`** — Datos de registro
- **`CreateAdminRequest`** — Creación de admin con rol
- **`UpdateProfileRequest`** — Actualización de perfil
- **`ChangePasswordRequest`** — Cambio de contraseña con confirmación
- **`UserType`** — `'passenger' | 'admin'`
- **`isAdminProfile()`** / **`isPassengerProfile()`** — Type guards

## `utils/` — Validación

`validation.ts` contiene esquemas Zod con reglas específicas:

- **Formato venezolano**: validación de teléfonos (`+58` / `0` + operador + 7 dígitos) y cédulas (`V-`/`E-` + 6-10 dígitos)
- **Contraseña**: mínimo 8 caracteres, mayúscula, minúscula, número
- **Limpieza automática** de espacios, guiones, paréntesis mediante `preprocess`
- **Esquemas**: `loginSchema`, `registerPassengerSchema`, `updateProfileSchema`, `changePasswordSchema`, `createAdminSchema`
- **Tipos inferidos** para cada esquema (`LoginFormData`, `RegisterPassengerFormData`, etc.)

## Dependencias

- `shared/store/authStore` — Store de Zustand para token y usuario
- `shared/components/EyeIcon` — Componente SVG para toggle de visibilidad
- `api/client` — Cliente HTTP genérico
- Librerías externas: `react-hook-form`, `@hookform/resolvers/zod`, `zustand`
