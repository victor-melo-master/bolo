# `modules/` — Módulos funcionales del frontend

Directorio que contiene los módulos autocontenidos de la aplicación. Cada módulo encapsula toda la lógica relacionada con un dominio específico del negocio.

## Estructura

```
modules/
├── auth/       Autenticación, registro, perfiles y gestión de usuarios
└── dashboard/  Panel de control (pendiente de implementación)
```

## Patrón de módulo

Cada módulo sigue una estructura consistente de 5 subdirectorios:

| Directorio | Propósito |
|---|---|
| `components/` | Componentes de presentación (formularios, vistas parciales) |
| `hooks/` | Hooks personalizados con estado, llamadas a la API y lógica de negocio |
| `services/` | Funciones que envuelven llamadas HTTP específicas del módulo |
| `types/` | Interfaces, tipos e inferencias TypeScript para el dominio |
| `utils/` | Funciones auxiliares, esquemas de validación (Zod) |

## Diagrama de flujo

```
Página (pages/)
  ↓
Hook (useX.ts)  ←  llamado desde la página
  ↓
Servicio (XApi.ts)  ←  hook invoca la función del servicio
  ↓
Cliente HTTP (api/client.ts)  ←  servicio usa apiClient genérico
  ↓
Middleware / API  ←  petición HTTP al backend
```

## Ventajas del patrón

- **Separación clara de responsabilidades**: componentes puramente visuales, hooks con estado, servicios de red
- **Reutilización**: los hooks pueden ser consumidos desde cualquier página
- **Escalabilidad**: añadir un nuevo módulo (ej. `trips/`, `wallet/`) solo implica crear la estructura de 5 directorios
- **Testabilidad**: cada capa se puede probar de forma aislada

## Módulo `auth`

Gestiona autenticación de pasajeros y administradores, registro, perfiles y cambio de contraseña. Ver `auth/README.md` para detalles completos.

## Módulo `dashboard`

Actualmente vacío. Alojará componentes y hooks específicos para la visualización del panel de control (estadísticas, viajes recientes, etc.).
