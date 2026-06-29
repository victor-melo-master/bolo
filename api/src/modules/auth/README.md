# `auth/` — Autenticación y Gestión de Usuarios

Módulo completo de autenticación con roles de administrador y pasajero. Implementa JWT con rotación de clave por sesión.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/admin/login` | Inicio de sesión administrador |
| POST | `/auth/admin/create` | Crear administrador |
| GET | `/auth/admin/profile` | Obtener perfil administrador |
| PUT | `/auth/admin/profile` | Actualizar perfil administrador |
| DELETE | `/auth/admin/profile` | Eliminar perfil administrador |
| PUT | `/auth/admin/password` | Cambiar contraseña administrador |
| POST | `/auth/passenger/register` | Registro de pasajero |
| POST | `/auth/passenger/login` | Inicio de sesión pasajero |
| GET | `/auth/passenger/profile` | Obtener perfil pasajero |
| PUT | `/auth/passenger/profile` | Actualizar perfil pasajero |
| DELETE | `/auth/passenger/profile` | Eliminar perfil pasajero |
| PUT | `/auth/passenger/password` | Cambiar contraseña pasajero |

## Entidades de dominio

- **Admin** — Usuario administrador con roles
- **Passenger** — Usuario pasajero
- **Association** — Asociación de transporte
- **DriverRequest** — Solicitud de registro de conductor
- **Session** — Sesión con JWT (rotación en cada login)

## Arquitectura

```
auth/
├── domain/            # Entidades, puertos de repositorio, excepciones
├── application/       # Casos de uso (login, register, profile, etc.)
├── infrastructure/    # TypeORM entities, JWT strategy, repositorios
└── interfaces/        # Controladores REST, DTOs de validación, guards
```
