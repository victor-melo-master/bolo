# AGENTS — Database / init.sql

## Propósito
Script único que define el esquema completo de PostgreSQL + PostGIS para BOLO. Idempotente, se ejecuta automáticamente al crear el contenedor por primera vez.

## Stack
PostgreSQL 18 · PostGIS 3 · pgcrypto · UUID v7 nativo

## Despliegue
Montado en el contenedor postgres como:
```
./database/init.sql → /docker-entrypoint-initdb.d/01_init.sql:ro
```

Se ejecuta **una sola vez** (al inicializar el volumen). Para re-ejecutar: borrar volumen y recreate.

## Estructura del script
```
init.sql (~680 líneas)
│
├── 1. Extensiones         pgcrypto (bcrypt), postgis (GEOGRAPHY)
├── 2. Esquemas (5)        auth, ops, fin, trip, audit
├── 3. Tipos ENUM (9)      admin_role, passenger_category, driver_request_status,
│                          trip_status, transaction_type, transaction_status,
│                          payment_method, payment_status, saga_status
├── 4. Funciones           update_updated_at_column(), prevent_modifications()
├── 5. Tablas (18)         passengers, admins, associations, sessions,
│                          driver_requests, exchange_rates, coop_fares,
│                          wallets, transactions, rates_config, saga_states,
│                          routes, vehicles, assigned_routes,
│                          trips, payments, gps_history,
│                          audit_log
├── 6. FK circulares       admins→associations, associations→admins
├── 7. Índices (63)        compuestos, parciales, espaciales GIST, cubrientes
├── 8. Triggers            trg_immutable_transactions, trg_immutable_audit,
│                          set_updated_at (automático en todas las tablas)
└── 9. Seeders             super_admin, wallet, rates, exchange_rate,
                           association, coop_fare
```

## Reglas de negocio en BD
- **Inmutabilidad**: `fin.transactions` y `audit.audit_log` → trigger bloquea UPDATE/DELETE
- **Precisión**: todos los montos en centavos (BIGINT), nunca floats
- **OCC**: `wallets.version` se incrementa en cada UPDATE
- **Geoespacial**: `GEOGRAPHY(Point, 4326)` con índices GIST
- **Idempotencia**: `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, `DROP TRIGGER IF EXISTS`

## Seeders
| Seeder | Valores |
|--------|---------|
| Super Admin | `+584121234567` / `admin@bolo.com` / password: `admin123` |
| Wallet | Saldo $0.00 |
| Rates config | 10% comisión, $1.50 tarifa base |
| Exchange rate | 36.50 VES/USD |
| Association | "Cooperativa Bolivariana", RIF J-12345678-9 |
| Coop fare | $1.50 base, -50¢ student, -30¢ elderly |
