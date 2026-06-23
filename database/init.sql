-- ============================================================
-- BOLO - BASE DE DATOS COMPLETA (MVP + FASE 2)
-- PostgreSQL 16 + PostGIS + pg_uuidv7
-- Fecha: 22/06/2026
-- ============================================================
-- ORDEN DE EJECUCIÓN (importante para dependencias):
--   1. Extensiones
--   2. Esquemas
--   3. Tipos ENUM (dependen de los esquemas)
--   4. Funciones auxiliares (dependen de nada)
--   5. Tablas (dependen de ENUMs y esquemas)
--   6. Índices
--   7. Triggers
--   8. Seeders
-- ============================================================


-- ============================================================
-- 1. EXTENSIONES NECESARIAS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- crypt() y gen_salt() para hashing de contraseñas
CREATE EXTENSION IF NOT EXISTS postgis;       -- GEOGRAPHY, GIST, ST_Distance, etc.


-- ============================================================
-- 2. ESQUEMAS (separación lógica por microservicio)
-- ============================================================
-- NOTA: Los esquemas deben crearse ANTES que los tipos ENUM,
-- ya que los ENUMs viven dentro de un esquema específico.
CREATE SCHEMA IF NOT EXISTS auth;   -- Microservicio: Auth & Users
CREATE SCHEMA IF NOT EXISTS ops;    -- Microservicio: Fleet & Operations
CREATE SCHEMA IF NOT EXISTS fin;    -- Microservicio: Wallet & Financial
CREATE SCHEMA IF NOT EXISTS trip;   -- Microservicio: Trip Execution
CREATE SCHEMA IF NOT EXISTS audit;  -- Auditoría global (logs inmutables)


-- ============================================================
-- 3. TIPOS ENUMERADOS
-- ============================================================

-- Roles del sistema (un usuario tiene exactamente uno)
CREATE TYPE auth.user_role AS ENUM (
    'passenger',          -- Pasajero regular
    'driver',             -- Conductor asociado
    'association_admin',  -- Admin de una cooperativa
    'super_admin'         -- Admin global BOLO
);

-- Categorías tarifarias del pasajero (afectan descuentos)
CREATE TYPE auth.user_category AS ENUM (
    'normal',   -- Tarifa estándar
    'student',  -- Requiere documento aprobado (student_doc_approved = TRUE)
    'elderly'   -- Tercera edad
);

-- Estado del proceso KYC del conductor
CREATE TYPE auth.driver_request_status AS ENUM (
    'pending',   -- En revisión
    'approved',  -- Aprobado por la asociación
    'rejected'   -- Rechazado (ver rejection_reason)
);

-- Ciclo de vida de un viaje
CREATE TYPE trip.trip_status AS ENUM (
    'requested',      -- Pasajero escaneó QR, esperando inicio
    'active',         -- Viaje en curso
    'completed',      -- Viaje finalizado y cobrado
    'cancelled',      -- Cancelado antes de iniciar
    'pending_credit'  -- Completado pero cobro pendiente (crédito de emergencia)
);

-- Tipos de movimiento en la billetera
CREATE TYPE fin.transaction_type AS ENUM (
    'deposit',     -- Recarga de saldo
    'withdrawal',  -- Retiro de saldo
    'refund',      -- Devolución por viaje cancelado
    'commission',  -- Comisión BOLO descontada al conductor
    'adjustment'   -- Ajuste manual por soporte
);

-- Estado de una transacción de billetera
CREATE TYPE fin.transaction_status AS ENUM (
    'pending',    -- En proceso (saga en curso)
    'completed',  -- Acreditado/debitado exitosamente
    'failed'      -- Falló (ver saga_states para detalle)
);

-- Métodos de pago disponibles para un viaje
CREATE TYPE fin.payment_method AS ENUM (
    'wallet',  -- Billetera BOLO (flujo principal)
    'card',    -- Tarjeta bancaria (Fase 2)
    'sms'      -- Pago por SMS (zonas sin internet)
);

-- Estado del pago de un viaje
CREATE TYPE fin.payment_status AS ENUM (
    'pending',     -- Pago iniciado, no confirmado
    'processing',  -- En proceso con el banco / saga activa
    'completed',   -- Pago exitoso
    'failed',      -- Pago fallido
    'refunded'     -- Devuelto al pasajero
);

-- Estado de la saga transaccional (patrón SAGA para microservicios)
CREATE TYPE fin.saga_status AS ENUM (
    'pending',       -- Saga creada, sin iniciar
    'in_progress',   -- Ejecutando pasos
    'completed',     -- Todos los pasos exitosos
    'failed',        -- Falló un paso, sin compensar aún
    'compensating',  -- Ejecutando rollback de pasos previos
    'compensated'    -- Rollback completo, estado consistente
);


-- ============================================================
-- 4. FUNCIONES AUXILIARES
-- ============================================================
-- NOTA: Las funciones van ANTES que los triggers que las referencian.

-- NOTA UUID => esta funcion solo en caso de desplegar en postgres 17 hacia abajo,
-- dado que los mismo no contienen la funcion uuidv7().
-- En postgres 18 la funcion es nativa de 'C' lo que resulta en mejor rendimiento.

-- !!! SOLO SI POSTGRES < V18 !!! --
-- 4.0 UUID v7 — Generación de UUIDs ordenables temporalmente
-- Reemplaza gen_random_uuid() (v4) para mejor rendimiento de índices.
-- Los UUID v7 comienzan con timestamp, garantizando inserciones secuenciales.
-- CREATE OR REPLACE FUNCTION uuidv7()
-- RETURNS UUID AS $$
-- DECLARE
--     timestamp_ms BIGINT;
--     random_bytes BYTEA;
-- BEGIN
--     timestamp_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
--     random_bytes := gen_random_bytes(10);
--     RETURN encode(
--         set_byte(
--             set_byte(
--                 substring(int8send(timestamp_ms) from 3 for 6) || random_bytes,
--                 6, (get_byte(random_bytes, 0) & 15) | 112  -- Versión 7
--             ),
--             8, (get_byte(random_bytes, 2) & 63) | 128      -- Variante 10xx
--         ), 'hex'
--     )::UUID;
-- END;
-- $$ LANGUAGE plpgsql VOLATILE;

-- -- 4.0b Extraer timestamp de un UUID v7 (útil para debugging y reportes)
-- CREATE OR REPLACE FUNCTION uuid_v7_timestamp(uuid UUID)
-- RETURNS TIMESTAMPTZ AS $$
-- BEGIN
--     RETURN to_timestamp(
--         ('x' || substring(uuid::text from 1 for 12))::BIT(48)::BIGINT / 1000.0
--     );
-- END;
-- $$ LANGUAGE plpgsql IMMUTABLE;


-- 4.1 Actualización automática de updated_at
-- Llamada por el trigger set_updated_at en cada UPDATE.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Bloqueo de modificaciones en tablas inmutables
-- Usado por fin.transactions y audit.audit_log.
-- Las transacciones y logs NUNCA se modifican ni eliminan;
-- cualquier corrección se hace con un registro nuevo (adjustment/refund).
CREATE OR REPLACE FUNCTION prevent_modifications()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'Tabla inmutable: no se permiten UPDATE ni DELETE en %. Usa un registro de ajuste.',
        TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 5. TABLAS
-- ============================================================

-- ----------------------------------------------------------
-- 5.1 ESQUEMA auth — Usuarios y acceso
-- ----------------------------------------------------------

-- Usuarios del sistema: pasajeros, conductores y admins.
-- La separación de roles permite que un mismo teléfono
-- no pueda registrarse dos veces.
CREATE TABLE IF NOT EXISTS auth.users (
    id              UUID         PRIMARY KEY DEFAULT uuidv7(),
    phone           VARCHAR(20)  UNIQUE NOT NULL,                    -- Login principal (con código país)
    email           VARCHAR(100) UNIQUE,                             -- Opcional, para admins
    password_hash   TEXT         NOT NULL,                           -- bcrypt vía pgcrypto
    full_name       VARCHAR(255) NOT NULL,
    cedula          VARCHAR(20)  UNIQUE,                             -- Cédula venezolana (V-/E-)
    role            auth.user_role    NOT NULL DEFAULT 'passenger',
    jwt_key         TEXT,                                            -- Secreto rotativo para invalidar tokens
    qr_code         VARCHAR(50)  UNIQUE,                             -- Código QR único del pasajero
    qr_key          TEXT,                                            -- Secreto de firma del QR (rotativo)
    qr_version      INT          DEFAULT 1,                          -- Versión del QR (incrementar para invalidar)
    category        auth.user_category DEFAULT 'normal',
    student_doc_approved BOOLEAN DEFAULT FALSE,                      -- TRUE solo si category='student' y doc revisado
    is_active       BOOLEAN      DEFAULT TRUE,
    deleted_at      TIMESTAMPTZ,                                     -- Soft delete: NULL = activo
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  DEFAULT clock_timestamp(),
    updated_at      TIMESTAMPTZ  DEFAULT clock_timestamp()
);

-- Cooperativas y asociaciones de transporte.
-- Cada asociación tiene un admin asignado (association_admin).
CREATE TABLE IF NOT EXISTS auth.associations (
    id         UUID         PRIMARY KEY DEFAULT uuidv7(),
    name       VARCHAR(255) UNIQUE NOT NULL,
    rif        VARCHAR(20)  UNIQUE NOT NULL,    -- RIF venezolano (J-/G-)
    address    TEXT,
    phone      VARCHAR(20),
    admin_id   UUID         REFERENCES auth.users(id) ON DELETE RESTRICT,  -- No borrar user si tiene asociación
    is_active  BOOLEAN      DEFAULT TRUE,
    created_at TIMESTAMPTZ  DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ  DEFAULT clock_timestamp()
);

-- Solicitudes de registro de conductores (proceso KYC).
-- Un conductor debe ser aprobado por su asociación antes de operar.
CREATE TABLE IF NOT EXISTS auth.driver_requests (
    id               UUID        PRIMARY KEY DEFAULT uuidv7(),
    driver_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    association_id   UUID        NOT NULL REFERENCES auth.associations(id) ON DELETE CASCADE,
    status           auth.driver_request_status DEFAULT 'pending',
    documents_urls   JSONB,          -- URLs de docs subidos (licencia, cédula, etc.)
    rejection_reason TEXT,           -- Obligatorio rellenar si status = 'rejected'
    created_at       TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at       TIMESTAMPTZ DEFAULT clock_timestamp()
);


-- ----------------------------------------------------------
-- 5.2 ESQUEMA fin — Tablas de tarifas y tasas (ANTES de ops)
-- ----------------------------------------------------------
-- MOTIVO: ops.routes necesita referenciar fin.coop_fares y fin.exchange_rates,
--         por lo que estas tablas deben crearse primero.
--         Así se respeta el flujo: una ruta referencia un tarifario,
--         el tarifario referencia una tasa de cambio.

-- 5.2.1 Tasas de cambio diarias (BCV u otra fuente oficial)
-- Almacena el valor de conversión de 1 USD a la moneda local.
-- Se espera un registro por día y moneda.
CREATE TABLE IF NOT EXISTS fin.exchange_rates (
    id            UUID           PRIMARY KEY DEFAULT uuidv7(),
    currency      VARCHAR(10)    NOT NULL,                -- Ej: 'VES', 'COP'
    rate          NUMERIC(19,6)  NOT NULL CHECK (rate > 0), -- Tasa: cuántas unidades locales por 1 USD
    effective_date DATE          NOT NULL DEFAULT CURRENT_DATE, -- Fecha de vigencia
    created_at    TIMESTAMPTZ    DEFAULT clock_timestamp(),
    updated_at    TIMESTAMPTZ    DEFAULT clock_timestamp()
);

-- 5.2.2 Tarifario de cooperativa (MONTO COOP)
-- Centraliza los precios y recargos/descuentos de cada asociación.
-- Una ruta se enlaza a un tarifario activo, no a un precio fijo.
-- Los montos se almacenan en centavos de dólar (BIGINT) para precisión exacta.
CREATE TABLE IF NOT EXISTS fin.coop_fares (
    id                UUID PRIMARY KEY DEFAULT uuidv7(),
    association_id    UUID NOT NULL REFERENCES auth.associations(id) ON DELETE RESTRICT,
    name              VARCHAR(100) NOT NULL,                 -- Nombre descriptivo (ej: "Tarifa estándar 2026")
    base_amount_usd   BIGINT NOT NULL CHECK (base_amount_usd >= 0), -- Monto base en centavos de USD (150 = $1.50)
    exchange_rate_id  UUID NOT NULL REFERENCES fin.exchange_rates(id) ON DELETE RESTRICT, -- Tasa de referencia
    -- Recargos por categoría de pasajero (en centavos de la moneda local).
    -- Pueden ser negativos para indicar descuento.
    surcharge_normal  BIGINT NOT NULL DEFAULT 0,
    surcharge_student BIGINT NOT NULL DEFAULT 0,
    surcharge_elderly BIGINT NOT NULL DEFAULT 0,
    is_active         BOOLEAN DEFAULT TRUE,                 -- Solo un tarifario activo por asociación a la vez
    created_at        TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at        TIMESTAMPTZ DEFAULT clock_timestamp(),
    -- Evita nombres duplicados dentro de la misma cooperativa
    CONSTRAINT uq_coop_fare_name_per_association UNIQUE (association_id, name)
);


-- ----------------------------------------------------------
-- 5.3 ESQUEMA ops — Flota y operaciones
-- ----------------------------------------------------------

-- Rutas de transporte de cada asociación.
-- Ahora la tarifa se define en fin.coop_fares; la ruta solo guarda
-- la referencia al tarifario activo (coop_fare_id).
CREATE TABLE IF NOT EXISTS ops.routes (
    id             UUID          PRIMARY KEY DEFAULT uuidv7(),
    association_id UUID          NOT NULL REFERENCES auth.associations(id) ON DELETE RESTRICT,
    name           VARCHAR(255)  NOT NULL,
    description    TEXT,
    coop_fare_id   UUID          NOT NULL REFERENCES fin.coop_fares(id) ON DELETE RESTRICT,  -- Tarifario asociado
    is_active      BOOLEAN       DEFAULT TRUE,
    created_at     TIMESTAMPTZ   DEFAULT clock_timestamp(),
    updated_at     TIMESTAMPTZ   DEFAULT clock_timestamp()
);

-- Vehículos registrados por asociación.
CREATE TABLE IF NOT EXISTS ops.vehicles (
    id             UUID         PRIMARY KEY DEFAULT uuidv7(),
    association_id UUID         NOT NULL REFERENCES auth.associations(id) ON DELETE CASCADE,
    plate          VARCHAR(20)  UNIQUE NOT NULL,
    model          VARCHAR(100),
    color          VARCHAR(50),
    capacity       INT          DEFAULT 15 CHECK (capacity > 0),  -- Pasajeros máximos
    is_active      BOOLEAN      DEFAULT TRUE,
    created_at     TIMESTAMPTZ  DEFAULT clock_timestamp(),
    updated_at     TIMESTAMPTZ  DEFAULT clock_timestamp()
);

-- Asignación diaria de conductor → ruta + vehículo.
-- Un conductor puede tener múltiples asignaciones históricas;
-- solo la activa (is_active = TRUE) se usa en producción.
-- CONSTRAINT: evita duplicar la asignación activa del mismo conductor.
CREATE TABLE IF NOT EXISTS ops.assigned_routes (
    id            UUID  PRIMARY KEY DEFAULT uuidv7(),
    driver_id     UUID  NOT NULL REFERENCES auth.users(id)    ON DELETE RESTRICT,
    route_id      UUID  NOT NULL REFERENCES ops.routes(id)    ON DELETE RESTRICT,
    vehicle_id    UUID  NOT NULL REFERENCES ops.vehicles(id)  ON DELETE RESTRICT,
    assigned_date DATE  DEFAULT CURRENT_DATE,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at    TIMESTAMPTZ DEFAULT clock_timestamp(),

    -- Un conductor no puede tener dos asignaciones activas simultáneas
    CONSTRAINT uq_driver_active_assignment UNIQUE (driver_id, is_active)
        DEFERRABLE INITIALLY DEFERRED  -- Permite desactivar la anterior y activar la nueva en una transacción
);


-- ----------------------------------------------------------
-- 5.4 ESQUEMA fin — Billeteras y transacciones
-- ----------------------------------------------------------

-- Billetera de cada usuario (también existe la billetera BOLO,
-- mapeada a un usuario especial con role='super_admin').
-- Todos los montos en centavos (BIGINT) para aritmética exacta.
CREATE TABLE IF NOT EXISTS fin.wallets (
    id                  UUID    PRIMARY KEY DEFAULT uuidv7(),
    user_id             UUID    UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    balance             BIGINT  NOT NULL DEFAULT 0 CHECK (balance >= 0),        -- Saldo disponible en centavos
    debt_balance        BIGINT  NOT NULL DEFAULT 0 CHECK (debt_balance >= 0),   -- Deuda por crédito de emergencia
    credit_used         BOOLEAN DEFAULT FALSE,                                   -- TRUE si usó crédito en el último viaje
    currency            VARCHAR(3) DEFAULT 'USD',
    last_transaction_at TIMESTAMPTZ,
    version             INT     NOT NULL DEFAULT 1,  -- OCC: se incrementa en cada UPDATE para detectar conflictos
    created_at          TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at          TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- Historial inmutable de movimientos de billetera.
-- NUNCA se hace UPDATE ni DELETE sobre esta tabla (ver trigger trg_immutable_transactions).
-- Cualquier corrección se registra como un nuevo registro tipo 'adjustment' o 'refund'.
CREATE TABLE IF NOT EXISTS fin.transactions (
    id          UUID   PRIMARY KEY DEFAULT uuidv7(),
    wallet_id   UUID   NOT NULL REFERENCES fin.wallets(id) ON DELETE RESTRICT,
    type        fin.transaction_type   NOT NULL,
    amount      BIGINT NOT NULL DEFAULT 0 CHECK (amount >= 0),  -- Siempre positivo; el tipo indica dirección
    status      fin.transaction_status DEFAULT 'pending',
    reference   VARCHAR(255),   -- ID externo (ej. referencia bancaria)
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT clock_timestamp(),
    completed_at TIMESTAMPTZ    -- NULL mientras status != 'completed'
);

-- Configuración global de comisiones y tarifas base.
-- Los montos son en centavos (BIGINT):
--   commission_percentage: base 10000 → 10000 = 100%, 1000 = 10%, 50 = 0.5%
--   base_fare_usd: 150 = $1.50 USD
-- Se inserta una nueva fila por cada cambio (historial de tarifas).
CREATE TABLE IF NOT EXISTS fin.rates_config (
    id                    UUID   PRIMARY KEY DEFAULT uuidv7(),
    commission_percentage BIGINT NOT NULL DEFAULT 1000
        CHECK (commission_percentage >= 0 AND commission_percentage <= 10000),  -- 0% a 100%
    base_fare_usd         BIGINT NOT NULL DEFAULT 150
        CHECK (base_fare_usd >= 0),                                             -- En centavos: 150 = $1.50
    indexed_to_dollar     BOOLEAN DEFAULT FALSE,  -- TRUE: ajuste automático según tasa BCV
    effective_from        TIMESTAMPTZ DEFAULT clock_timestamp(),                -- Vigencia desde
    updated_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,   -- Auditoría: quién cambió
    created_at            TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at            TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- Estado de las sagas transaccionales (patrón SAGA distribuido).
-- Cada pago de viaje dispara una saga que coordina:
--   débito pasajero → crédito conductor → comisión BOLO → confirmación.
-- Si un paso falla, la saga compensa los pasos anteriores.
CREATE TABLE IF NOT EXISTS fin.saga_states (
    id             UUID   PRIMARY KEY DEFAULT uuidv7(),
    transaction_id UUID   REFERENCES fin.transactions(id) ON DELETE CASCADE,
    current_step   VARCHAR(50),   -- Nombre del paso actual (ej. 'debit_passenger')
    status         fin.saga_status DEFAULT 'pending',
    payload        JSONB,          -- Contexto completo de la saga para re-intentos
    retry_count    INT    DEFAULT 0 CHECK (retry_count >= 0),
    created_at     TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at     TIMESTAMPTZ DEFAULT clock_timestamp()
);


-- ----------------------------------------------------------
-- 5.5 ESQUEMA trip — Ejecución de viajes
-- ----------------------------------------------------------

-- Registro de cada viaje.
-- El pasajero inicia el viaje escaneando el QR del conductor.
-- Las coordenadas usan GEOGRAPHY (WGS84) para cálculos de distancia reales.
-- AHORA INCLUYE auditoría financiera: tarifario utilizado, tasa de cambio aplicada
-- y descuento/recargo total, para inmutabilidad del cálculo del precio.
CREATE TABLE IF NOT EXISTS trip.trips (
    id                  UUID   PRIMARY KEY DEFAULT uuidv7(),
    passenger_id        UUID   NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    driver_id           UUID   NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    route_id            UUID   REFERENCES ops.routes(id) ON DELETE SET NULL,   -- NULL si la ruta fue eliminada
    origin_geom         GEOGRAPHY(Point, 4326) NOT NULL,   -- Punto de abordaje
    dest_geom           GEOGRAPHY(Point, 4326) NOT NULL,   -- Punto de destino
    status              trip.trip_status DEFAULT 'requested',

    -- Tarifa final cobrada (centavos de la moneda local)
    fare                BIGINT CHECK (fare >= 0),

    -- Auditoría del cálculo de la tarifa (valores congelados al momento del viaje)
    coop_fare_id        UUID REFERENCES fin.coop_fares(id) ON DELETE RESTRICT,  -- Tarifario usado
    applied_exchange_rate NUMERIC(19,6) CHECK (applied_exchange_rate > 0),      -- Tasa exacta al momento del cobro
    applied_discount    BIGINT DEFAULT 0,                                       -- Descuento/recargo total aplicado (centavos)

    distance            DECIMAL(10,2) CHECK (distance >= 0),  -- Kilómetros
    duration            INT    CHECK (duration >= 0),          -- Segundos
    qr_code_scanned     VARCHAR(50),   -- QR del conductor que el pasajero escaneó
    stop_requested      BOOLEAN DEFAULT FALSE,   -- Pasajero solicitó parada anticipada
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at          TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- Índice espacial sobre origen (obligatorio para PostGIS).
-- Permite: "conductores cerca de X coordenada" en O(log n).
CREATE INDEX idx_trips_origin_geom ON trip.trips USING GIST (origin_geom);

-- Pago asociado a un viaje (relación 1:1 con trip).
-- Creado cuando el viaje cambia a status='completed'.
CREATE TABLE IF NOT EXISTS trip.payments (
    id               UUID   PRIMARY KEY DEFAULT uuidv7(),
    trip_id          UUID   UNIQUE NOT NULL REFERENCES trip.trips(id) ON DELETE RESTRICT,
    amount           BIGINT NOT NULL CHECK (amount >= 0),           -- Total cobrado en centavos
    method           fin.payment_method  DEFAULT 'wallet',
    status           fin.payment_status  DEFAULT 'pending',
    reference        VARCHAR(255),      -- Referencia bancaria externa (si method != 'wallet')
    bank_response    JSONB,             -- Respuesta cruda del banco (para soporte)
    commission_bolo  BIGINT DEFAULT 0 CHECK (commission_bolo >= 0), -- Porción BOLO del amount
    created_at       TIMESTAMPTZ DEFAULT clock_timestamp(),
    completed_at     TIMESTAMPTZ        -- NULL hasta que status = 'completed'
);

-- Historial GPS del viaje (series temporales).
-- Volumen alto: ~1 punto/seg × duración del viaje.
-- Candidata a convertirse en hypertable de TimescaleDB (ver sección 8).
CREATE TABLE IF NOT EXISTS trip.gps_history (
    id          UUID    PRIMARY KEY DEFAULT uuidv7(),
    trip_id     UUID    NOT NULL REFERENCES trip.trips(id) ON DELETE CASCADE,
    location    GEOGRAPHY(Point, 4326) NOT NULL,
    speed       DECIMAL(5,2),           -- km/h
    heading     INT CHECK (heading >= 0 AND heading <= 360),  -- Grados (0=Norte)
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);


-- ----------------------------------------------------------
-- 5.6 ESQUEMA audit — Logs globales inmutables
-- ----------------------------------------------------------

-- Log de auditoría de todas las acciones sensibles del sistema.
-- NUNCA se modifica ni elimina (ver trigger trg_immutable_audit).
CREATE TABLE IF NOT EXISTS audit.audit_log (
    id         UUID    PRIMARY KEY DEFAULT uuidv7(),
    user_id    UUID    REFERENCES auth.users(id) ON DELETE SET NULL,  -- NULL si el user fue borrado
    action     VARCHAR(255) NOT NULL,   -- Ej: 'user.login', 'trip.start', 'wallet.deposit'
    details    JSONB,                   -- Payload completo del evento
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
    -- Sin updated_at: este registro es inmutable por diseño
);


-- ============================================================
-- 6. ÍNDICES DE RENDIMIENTO
-- ============================================================

-- auth.users
-- Índice en phone: lookup principal de login (O(1) efectivo)
CREATE INDEX idx_users_phone ON auth.users(phone);
-- Índice parcial en email: solo los que tienen email (ahorra espacio)
CREATE INDEX idx_users_email ON auth.users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_cedula ON auth.users(cedula);
-- Índice parcial en conductores activos: ~100K registros vs 1M total
-- ✅ Más eficiente que indexar role completo
CREATE INDEX idx_active_drivers ON auth.users(id) WHERE role = 'driver' AND is_active = TRUE;
-- Índice parcial en QR: solo pasajeros con QR asignado
CREATE INDEX idx_users_qr ON auth.users(qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX idx_users_is_active ON auth.users(is_active);

-- auth.driver_requests
-- Índice compuesto: cubre la consulta "solicitudes de conductor X en asociación Y con estado Z"
-- ✅ Reemplaza tres índices separados (driver_id, association_id, status)
CREATE INDEX idx_driver_requests_composite ON auth.driver_requests(driver_id, association_id, status);

-- fin.exchange_rates
-- Índice por fecha descendente: obtener la tasa más reciente rápidamente
CREATE INDEX idx_exchange_rates_date ON fin.exchange_rates(effective_date DESC);
-- Restricción única compuesta: no puede haber dos tasas para la misma moneda y fecha
CREATE UNIQUE INDEX idx_exchange_rates_unique ON fin.exchange_rates(currency, effective_date);

-- fin.coop_fares
-- Índice para buscar tarifarios por asociación
CREATE INDEX idx_coop_fares_association ON fin.coop_fares(association_id);
-- Índice parcial sobre tarifarios activos (la mayoría de las consultas solo necesitan el activo)
CREATE INDEX idx_coop_fares_active ON fin.coop_fares(id) WHERE is_active = TRUE;

-- ops.routes
-- Índice parcial: solo rutas activas (las inactivas rara vez se consultan)
CREATE INDEX idx_routes_active ON ops.routes(id) WHERE is_active = TRUE;
CREATE INDEX idx_routes_association_id ON ops.routes(association_id);
-- NUEVO: buscar rutas por tarifario (útil para reportes de cuántas rutas usan cada tarifa)
CREATE INDEX idx_routes_coop_fare ON ops.routes(coop_fare_id);

-- ops.vehicles
CREATE INDEX idx_vehicles_association_id ON ops.vehicles(association_id);
CREATE INDEX idx_vehicles_plate ON ops.vehicles(plate);

-- ops.assigned_routes
-- Índice parcial: asignaciones activas de un conductor (la consulta más frecuente)
CREATE INDEX idx_assigned_active ON ops.assigned_routes(driver_id) WHERE is_active = TRUE;
CREATE INDEX idx_assigned_routes_route_id ON ops.assigned_routes(route_id);

-- fin.wallets
-- Índice cubriente: incluye balance y version → el SELECT no lee la tabla (index-only scan)
-- ✅ Crítico para OCC: "SELECT balance, version FROM wallets WHERE user_id = ?"
CREATE INDEX idx_wallets_user_balance ON fin.wallets(user_id) INCLUDE (balance, version);
CREATE INDEX idx_wallets_credit_used ON fin.wallets(credit_used);

-- fin.transactions
CREATE INDEX idx_transactions_wallet_id ON fin.transactions(wallet_id);
CREATE INDEX idx_transactions_status ON fin.transactions(status);
-- Orden DESC: las consultas de historial siempre traen las más recientes primero
CREATE INDEX idx_transactions_created_at ON fin.transactions(created_at DESC);

-- fin.saga_states
CREATE INDEX idx_saga_states_transaction_id ON fin.saga_states(transaction_id);
-- Índice en status: el worker de reintentos busca sagas 'pending' o 'failed'
CREATE INDEX idx_saga_states_status ON fin.saga_states(status);

-- trip.trips
-- Índice compuesto: resuelve "viajes activos del pasajero X" en un solo paso
-- ✅ Más eficiente que índices separados en passenger_id y status
CREATE INDEX idx_trips_passenger_status ON trip.trips(passenger_id, status);
CREATE INDEX idx_trips_driver_id ON trip.trips(driver_id);
CREATE INDEX idx_trips_status ON trip.trips(status);
-- Para validación de QR: "¿este QR pertenece a un viaje activo?"
CREATE INDEX idx_trips_qr_code_scanned ON trip.trips(qr_code_scanned);
CREATE INDEX idx_trips_created_at ON trip.trips(created_at DESC);
-- NUEVO: auditoría de tarifas usadas en viajes
CREATE INDEX idx_trips_coop_fare ON trip.trips(coop_fare_id);

-- trip.payments
CREATE INDEX idx_payments_trip_id ON trip.payments(trip_id);
CREATE INDEX idx_payments_status ON trip.payments(status);

-- trip.gps_history
-- Índice espacial: "última ubicación conocida del conductor" via ST_Distance
CREATE INDEX idx_gps_location ON trip.gps_history USING GIST (location);
CREATE INDEX idx_gps_history_trip_id ON trip.gps_history(trip_id);
CREATE INDEX idx_gps_history_recorded_at ON trip.gps_history(recorded_at DESC);
-- Índice compuesto: reconstruir el track completo de un viaje ordenado por tiempo
CREATE INDEX idx_gps_trip_time ON trip.gps_history(trip_id, recorded_at DESC);

-- audit.audit_log
CREATE INDEX idx_audit_log_user_id ON audit.audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit.audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit.audit_log(created_at DESC);


-- ============================================================
-- 7. TRIGGERS
-- ============================================================

-- 7.1 Inmutabilidad de fin.transactions
-- Cualquier intento de UPDATE o DELETE lanza una excepción.
-- Las correcciones se hacen creando un registro tipo 'adjustment' o 'refund'.
CREATE TRIGGER trg_immutable_transactions
    BEFORE UPDATE OR DELETE ON fin.transactions
    FOR EACH ROW EXECUTE FUNCTION prevent_modifications();

-- 7.2 Inmutabilidad de audit.audit_log
-- Los logs de auditoría nunca se modifican ni eliminan.
CREATE TRIGGER trg_immutable_audit
    BEFORE UPDATE OR DELETE ON audit.audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_modifications();

-- 7.3 Actualización automática de updated_at en todas las tablas
-- Este bloque aplica el trigger dinámicamente a todas las tablas
-- que tienen la columna updated_at, sin necesidad de listarlas manualmente.
-- NOTA: Si se re-ejecuta el script, el DROP TRIGGER IF EXISTS evita errores.
DO $$
DECLARE
    t_row RECORD;
BEGIN
    FOR t_row IN
        SELECT table_schema, table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
            AND table_schema NOT IN ('pg_catalog', 'information_schema')
    LOOP
        -- Eliminar trigger previo si existe (idempotente en re-ejecuciones)
        EXECUTE format(
            'DROP TRIGGER IF EXISTS set_updated_at ON %I.%I;',
            t_row.table_schema, t_row.table_name
        );
        EXECUTE format(
            'CREATE TRIGGER set_updated_at
             BEFORE UPDATE ON %I.%I
             FOR EACH ROW
             EXECUTE FUNCTION update_updated_at_column();',
            t_row.table_schema, t_row.table_name
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 8. TIMESCALEDB (Opcional — alta performance para GPS)
-- ============================================================
-- Si TimescaleDB está instalado, convierte gps_history en hypertable
-- particionado por tiempo. Mejora dramáticamente queries de rango temporal
-- y permite compresión automática de datos históricos.
--
-- Requisito: CREATE EXTENSION IF NOT EXISTS timescaledb;
--
-- SELECT create_hypertable(
--     'trip.gps_history',
--     'recorded_at',
--     chunk_time_interval => INTERVAL '1 day',
--     if_not_exists => TRUE
-- );


-- ============================================================
-- 9. DATOS INICIALES (SEEDERS)
-- ============================================================

-- 9.1 Super Admin por defecto
-- Contraseña inicial: 'admin123' (cambiar inmediatamente en producción)
INSERT INTO auth.users (phone, email, password_hash, full_name, role, is_active)
VALUES (
    '+584121234567',
    'admin@bolo.com',
    crypt('admin123', gen_salt('bf', 10)),
    'Super Admin BOLO',
    'super_admin',
    TRUE
)
ON CONFLICT (phone) DO NOTHING;

-- 9.2 Billetera del Super Admin (necesaria para flujos financieros internos)
INSERT INTO fin.wallets (user_id, balance, currency)
SELECT id, 0, 'USD'
FROM auth.users
WHERE role = 'super_admin'
    AND NOT EXISTS (
        SELECT 1 FROM fin.wallets w
        WHERE w.user_id = auth.users.id
    )
LIMIT 1;

-- 9.3 Configuración inicial de comisiones y tarifas globales
-- commission_percentage: 1000 en base 10000 = 10%
-- base_fare_usd: 150 centavos = $1.50 USD
INSERT INTO fin.rates_config (commission_percentage, base_fare_usd, indexed_to_dollar, updated_by)
SELECT 1000, 150, FALSE, id
FROM auth.users
WHERE role = 'super_admin'
    AND NOT EXISTS (SELECT 1 FROM fin.rates_config)
LIMIT 1;

-- 9.4 Tasa de cambio inicial (ejemplo VES)
INSERT INTO fin.exchange_rates (currency, rate, effective_date)
VALUES ('VES', 36.50, CURRENT_DATE)
ON CONFLICT (currency, effective_date) DO NOTHING;

-- 9.5 Asociación de ejemplo (para desarrollo y pruebas)
INSERT INTO auth.associations (id, name, rif, admin_id)
SELECT uuidv7(), 'Cooperativa Bolivariana', 'J-12345678-9', id
FROM auth.users WHERE role = 'super_admin' LIMIT 1
ON CONFLICT (rif) DO NOTHING;

-- 9.6 Tarifario de ejemplo para la asociación creada
-- base_amount_usd: 150 centavos ($1.50)
-- surcharge_normal: 0 (sin recargo)
-- surcharge_student: -50 (descuento de 50 centavos)
-- surcharge_elderly: -30 (descuento de 30 centavos)
INSERT INTO fin.coop_fares (association_id, name, base_amount_usd, exchange_rate_id, surcharge_normal, surcharge_student, surcharge_elderly)
SELECT 
    a.id, 
    'Tarifa estándar 2026', 
    150, -- $1.50 USD en centavos
    er.id, 
    0,   -- normal sin recargo
    -50, -- estudiante: descuento de 50 centavos
    -30  -- tercera edad: descuento de 30 centavos
FROM auth.associations a
CROSS JOIN fin.exchange_rates er
WHERE a.rif = 'J-12345678-9' AND er.currency = 'VES' AND er.effective_date = CURRENT_DATE
ON CONFLICT (association_id, name) DO NOTHING;


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================