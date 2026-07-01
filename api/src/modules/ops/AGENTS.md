# AGENTS — Módulo de Operaciones (Ops)

## Propósito
Gestión de rutas de transporte, vehículos, asignaciones diarias y cooperativas.

## Estado
🔄 Parcial — Route + Association funcionales. Vehicles y AssignedRoutes pendientes.

## Entidades de dominio
| Entidad | Esquema BD | Propósito | Estado |
|---------|-----------|-----------|--------|
| `RouteEntity` | `ops.routes` | Ruta de transporte, referencias tarifario | ✅ |
| (VehicleEntity) | `ops.vehicles` | Vehículo por asociación | ⏳ |
| (AssignedRoute) | `ops.assigned_routes` | Asignación diaria conductor→ruta+vehículo | ⏳ |

## Casos de uso
- `CreateRouteUseCase` — crea ruta, valida asociación + tarifario
- `CreateAssociationUseCase` — crea cooperativa, valida RIF único

## Endpoints REST
| Método | Ruta | Controlador | Estado |
|--------|------|-------------|--------|
| POST | `/ops/routes` | RouteController | ✅ |
| POST | `/ops/associations` | AssociationController | ✅ |

## Pendiente
- Vehicle entity + CRUD
- AssignedRoute entity + lógica de asignación diaria
- Restricción: un conductor no puede tener dos asignaciones activas simultáneas
- FK a `auth.admins` (drivers) y `ops.vehicles`
