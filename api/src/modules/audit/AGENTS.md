# AGENTS — Módulo de Auditoría (Audit)

## Propósito
Logs inmutables de todas las acciones sensibles del sistema.

## Estado
⏳ Stub — carpetas creadas, sin implementación.

## Entidad planeada
| Entidad | Esquema BD | Propósito |
|---------|-----------|-----------|
| `AuditEntry` | `audit.audit_log` | Log con user_id, action, details (JSONB), ip_address, user_agent |

## Lo que hay que implementar
- Entidad de dominio AuditEntry
- Servicio de auditoría (emitir eventos)
- Decorador/Interceptor para log automatizado
- Consulta de historial con paginación
- Integración con `audit.audit_log` (tabla inmutable, trigger bloquea UPDATE/DELETE)

## Notas BD
- `audit.audit_log` no tiene `updated_at` (es inmutable por diseño)
- Índices en user_id, action, created_at DESC
- FK polimórfica: user_id referencia passengers o admins (controlado por app)
