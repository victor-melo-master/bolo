# AGENTS — Módulo de Viajes (Trip)

## Propósito
Ejecución de viajes: inicio (scan QR), tracking GPS, finalización, pago.

## Estado
⏳ Stub — carpetas creadas, sin implementación.

## Entidades planeadas
| Entidad | Esquema BD | Propósito |
|---------|-----------|-----------|
| `TripEntity` | `trip.trips` | Viaje con origen/destino (GEOGRAPHY), status, fare |
| `PaymentEntity` | `trip.payments` | Pago 1:1 con trip, method, commission_bolo |
| `GpsHistoryEntity` | `trip.gps_history` | Tracking GPS (~1 punto/seg), location, speed, heading |

## Lo que hay que implementar
- Entidades de dominio (3)
- Casos de uso: RequestTrip, StartTrip, CompleteTrip, CancelTrip
- Integración con PostGIS (ST_DWithin, ST_Distance)
- Cálculo de tarifa según cooperativa + categoría pasajero
- Pago vía wallet (saga distribuida con fin.SagaState)
- WebSockets para tracking en tiempo real

## Notas BD
- `trip.trips` tiene auditoría financiera congelada: coop_fare_id, applied_exchange_rate, applied_discount
- `trip.gps_history` es candidata a hypertable TimescaleDB
- Índices espaciales GIST en origin_geom y location
- Status cycle: requested → active → completed | cancelled | pending_credit
