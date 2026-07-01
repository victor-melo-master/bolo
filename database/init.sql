-- ============================================================
-- BOLO - BASE DE DATOS COMPLETA (MVP + FASE 2)
-- PostgreSQL 18 + PostGIS (uuid_v7 nativo)
-- Fecha: 29/06/2026
-- ============================================================
-- ORDEN DE EJECUCIÓN (importante para dependencias):
--   1. Extensiones
--   2. Esquemas
--   3. Tipos ENUM (dependen de los esquemas)
--   4. Funciones auxiliares (triggers)
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

-- Roles específicos para administradores y conductores.
-- Se elimina el antiguo ENUM auth.user_role que mezclaba pasajeros.
CREATE TYPE auth.admin_role AS ENUM (
    'driver',             -- Conductor asociado a una cooperativa
    'association_admin',  -- Administrador de una cooperativa
    'super_admin'         -- Administrador global del sistema BOLO
);

-- Categorías tarifarias exclusivas de pasajeros.
CREATE TYPE auth.passenger_category AS ENUM (
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

-- 5.1.1 Pasajeros — Usuarios finales que solicitan viajes.
-- Cada pasajero tiene un jwt_key para la rotación de sesiones JWT.
-- Los campos de QR se han eliminado porque el QR lo porta el conductor.
CREATE TABLE IF NOT EXISTS auth.passengers (
    id              UUID            PRIMARY KEY DEFAULT uuidv7(),
    phone           VARCHAR(20)     UNIQUE NOT NULL,                    -- Login principal (con código país)
    email           VARCHAR(100)    UNIQUE,                             -- Opcional, para admins
    password_hash   TEXT            NOT NULL,                           -- bcrypt vía pgcrypto
    full_name       VARCHAR(255)    NOT NULL,
    cedula          VARCHAR(20)     UNIQUE,                             -- Cédula venezolana (V-/E-)
    jwt_key         TEXT,                                               -- Secreto rotativo para invalidar tokens del pasajero
    category        auth.passenger_category DEFAULT 'normal',          -- Categoría tarifaria
    student_doc_approved BOOLEAN    DEFAULT FALSE,                      -- TRUE solo si category='student' y doc revisado
    is_active       BOOLEAN         DEFAULT TRUE,
    deleted_at      TIMESTAMPTZ,                                        -- Soft delete: NULL = activo
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     DEFAULT clock_timestamp(),
    updated_at      TIMESTAMPTZ     DEFAULT clock_timestamp()
);

-- 5.1.2 Administradores y Conductores — Usuarios con roles administrativos o de conducción.
-- Ahora los campos de QR están aquí porque son los conductores quienes muestran el QR.
-- Los jwt_key individuales se han movido a la tabla auth.sessions.
CREATE TABLE IF NOT EXISTS auth.admins (
    id              UUID            PRIMARY KEY DEFAULT uuidv7(),
    phone           VARCHAR(20)     UNIQUE NOT NULL,
    email           VARCHAR(100)    UNIQUE,
    password_hash   TEXT            NOT NULL,
    full_name       VARCHAR(255)    NOT NULL,
    cedula          VARCHAR(20)     UNIQUE,
    role            auth.admin_role NOT NULL,                           -- driver, association_admin, super_admin
    qr_code         VARCHAR(50)     UNIQUE,                             -- Código QR único del conductor
    qr_key          TEXT,                                               -- Secreto de firma del QR (rotativo)
    qr_version      INT             DEFAULT 1,                          -- Versión del QR (incrementar para invalidar)
    association_id  UUID,            -- FK agregada más abajo con ALTER TABLE
    is_active       BOOLEAN         DEFAULT TRUE,
    deleted_at      TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     DEFAULT clock_timestamp(),
    updated_at      TIMESTAMPTZ     DEFAULT clock_timestamp()
);

-- 5.1.3 Cooperativas y asociaciones de transporte.
-- El admin_id ahora apunta a auth.admins.
CREATE TABLE IF NOT EXISTS auth.associations (
    id         UUID         PRIMARY KEY DEFAULT uuidv7(),
    name       VARCHAR(255) UNIQUE NOT NULL,
    rif        VARCHAR(20)  UNIQUE NOT NULL,    -- RIF venezolano (J-/G-)
    address    TEXT,
    phone      VARCHAR(20),
    admin_id   UUID,         -- FK agregada más abajo con ALTER TABLE
    is_active  BOOLEAN      DEFAULT TRUE,
    created_at TIMESTAMPTZ  DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ  DEFAULT clock_timestamp()
);

-- 5.1.4 Solicitudes de registro de conductores (proceso KYC).
-- La FK driver_id ahora apunta a auth.admins.
CREATE TABLE IF NOT EXISTS auth.driver_requests (
    id               UUID        PRIMARY KEY DEFAULT uuidv7(),
    driver_id        UUID        NOT NULL REFERENCES auth.admins(id) ON DELETE CASCADE,
    association_id   UUID        NOT NULL REFERENCES auth.associations(id) ON DELETE CASCADE,
    status           auth.driver_request_status DEFAULT 'pending',
    documents_urls   JSONB,          -- URLs de docs subidos (licencia, cédula, etc.)
    rejection_reason TEXT,           -- Obligatorio rellenar si status = 'rejected'
    created_at       TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at       TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 5.1.5 Sesiones activas (JWT Key Rotation por dispositivo y tipo de usuario).
-- Reemplaza las antiguas columnas jwt_key_phone y jwt_key_web.
-- Permite manejar múltiples dispositivos (phone, web, tablet) y tipos de usuario (admin, passenger)
-- en una única tabla, facilitando la revocación selectiva de sesiones.
CREATE TABLE IF NOT EXISTS auth.sessions (
    id          UUID         PRIMARY KEY DEFAULT uuidv7(),
    user_id     UUID         NOT NULL,                                  -- Referencia polimórfica (auth.admins o auth.passengers)
    user_type   VARCHAR(20)  NOT NULL CHECK (user_type IN ('admin', 'passenger')),
    client_type VARCHAR(20)  NOT NULL CHECK (client_type IN ('phone', 'web', 'tablet')),
    jwt_key     TEXT         NOT NULL,                                  -- Secreto de firma para esta sesión
    expires_at  TIMESTAMPTZ  NOT NULL,                                  -- Fecha de expiración de la sesión
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMPTZ  DEFAULT clock_timestamp(),
    updated_at  TIMESTAMPTZ  DEFAULT clock_timestamp()
);

-- 🔗 Foreign Keys para resolver dependencia circular
-- Se añaden después de que todas las tablas existen
ALTER TABLE auth.admins 
    ADD CONSTRAINT fk_admins_association 
    FOREIGN KEY (association_id) REFERENCES auth.associations(id) ON DELETE SET NULL;

ALTER TABLE auth.associations 
    ADD CONSTRAINT fk_associations_admin 
    FOREIGN KEY (admin_id) REFERENCES auth.admins(id) ON DELETE RESTRICT;


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
-- La FK driver_id ahora apunta a auth.admins en lugar de auth.users.
CREATE TABLE IF NOT EXISTS ops.assigned_routes (
    id            UUID  PRIMARY KEY DEFAULT uuidv7(),
    driver_id     UUID  NOT NULL REFERENCES auth.admins(id)    ON DELETE RESTRICT,
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

-- Billetera de cada usuario (pasajeros, conductores y BOLO).
-- La FK no se declara aquí para permitir referencias tanto a auth.passengers como a auth.admins.
-- La integridad se controla desde la aplicación.
CREATE TABLE IF NOT EXISTS fin.wallets (
    id                  UUID    PRIMARY KEY DEFAULT uuidv7(),
    user_id             UUID    UNIQUE NOT NULL,                                -- Referencia polimórfica (passenger o admin)
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
    updated_by            UUID REFERENCES auth.admins(id) ON DELETE SET NULL,   -- Auditoría: quién cambió (ahora apunta a admins)
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
-- passenger_id ahora referencia auth.passengers y conductor_id a auth.admins.
CREATE TABLE IF NOT EXISTS trip.trips (
    id                  UUID   PRIMARY KEY DEFAULT uuidv7(),
    passenger_id        UUID   NOT NULL REFERENCES auth.passengers(id) ON DELETE RESTRICT,
    driver_id           UUID   NOT NULL REFERENCES auth.admins(id) ON DELETE RESTRICT,
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
-- La FK user_id se omite para permitir referencias tanto a auth.passengers como a auth.admins.
CREATE TABLE IF NOT EXISTS audit.audit_log (
    id         UUID    PRIMARY KEY DEFAULT uuidv7(),
    user_id    UUID,             -- Puede ser id de auth.passengers o auth.admins (polimórfico)
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

-- auth.passengers
CREATE INDEX idx_passengers_phone ON auth.passengers(phone);
CREATE INDEX idx_passengers_email ON auth.passengers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_passengers_cedula ON auth.passengers(cedula);
CREATE INDEX idx_passengers_is_active ON auth.passengers(is_active);

-- auth.admins
CREATE INDEX idx_admins_phone ON auth.admins(phone);
CREATE INDEX idx_admins_email ON auth.admins(email) WHERE email IS NOT NULL;
CREATE INDEX idx_admins_cedula ON auth.admins(cedula);
CREATE INDEX idx_admins_role ON auth.admins(role);
CREATE INDEX idx_admins_association ON auth.admins(association_id);
CREATE INDEX idx_admins_qr ON auth.admins(qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX idx_admins_is_active ON auth.admins(is_active);

-- auth.sessions
CREATE INDEX idx_sessions_user ON auth.sessions(user_id, user_type);
CREATE INDEX idx_sessions_active ON auth.sessions(is_active) WHERE is_active = TRUE;

-- auth.driver_requests
CREATE INDEX idx_driver_requests_composite ON auth.driver_requests(driver_id, association_id, status);

-- fin.exchange_rates
CREATE INDEX idx_exchange_rates_date ON fin.exchange_rates(effective_date DESC);
CREATE UNIQUE INDEX idx_exchange_rates_unique ON fin.exchange_rates(currency, effective_date);

-- fin.coop_fares
CREATE INDEX idx_coop_fares_association ON fin.coop_fares(association_id);
CREATE INDEX idx_coop_fares_active ON fin.coop_fares(id) WHERE is_active = TRUE;

-- ops.routes
CREATE INDEX idx_routes_active ON ops.routes(id) WHERE is_active = TRUE;
CREATE INDEX idx_routes_association_id ON ops.routes(association_id);
CREATE INDEX idx_routes_coop_fare ON ops.routes(coop_fare_id);

-- ops.vehicles
CREATE INDEX idx_vehicles_association_id ON ops.vehicles(association_id);
CREATE INDEX idx_vehicles_plate ON ops.vehicles(plate);

-- ops.assigned_routes
CREATE INDEX idx_assigned_active ON ops.assigned_routes(driver_id) WHERE is_active = TRUE;
CREATE INDEX idx_assigned_routes_route_id ON ops.assigned_routes(route_id);

-- fin.wallets
CREATE INDEX idx_wallets_user_balance ON fin.wallets(user_id) INCLUDE (balance, version);
CREATE INDEX idx_wallets_credit_used ON fin.wallets(credit_used);

-- fin.transactions
CREATE INDEX idx_transactions_wallet_id ON fin.transactions(wallet_id);
CREATE INDEX idx_transactions_status ON fin.transactions(status);
CREATE INDEX idx_transactions_created_at ON fin.transactions(created_at DESC);

-- fin.saga_states
CREATE INDEX idx_saga_states_transaction_id ON fin.saga_states(transaction_id);
CREATE INDEX idx_saga_states_status ON fin.saga_states(status);

-- trip.trips
CREATE INDEX idx_trips_passenger_status ON trip.trips(passenger_id, status);
CREATE INDEX idx_trips_driver_id ON trip.trips(driver_id);
CREATE INDEX idx_trips_status ON trip.trips(status);
CREATE INDEX idx_trips_qr_code_scanned ON trip.trips(qr_code_scanned);
CREATE INDEX idx_trips_created_at ON trip.trips(created_at DESC);
CREATE INDEX idx_trips_coop_fare ON trip.trips(coop_fare_id);

-- trip.payments
CREATE INDEX idx_payments_trip_id ON trip.payments(trip_id);
CREATE INDEX idx_payments_status ON trip.payments(status);

-- trip.gps_history
CREATE INDEX idx_gps_location ON trip.gps_history USING GIST (location);
CREATE INDEX idx_gps_history_trip_id ON trip.gps_history(trip_id);
CREATE INDEX idx_gps_history_recorded_at ON trip.gps_history(recorded_at DESC);
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

-- 7.3 Actualización automática de updated_at en todas las tablas que tengan esa columna
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
-- 8. DATOS INICIALES (SEEDERS)
-- ============================================================




-- 8.2 Billetera del Super Admin
INSERT INTO fin.wallets (user_id, balance, currency)
SELECT id, 0, 'USD'
FROM auth.admins
WHERE role = 'super_admin'
    AND NOT EXISTS (
        SELECT 1 FROM fin.wallets w
        WHERE w.user_id = auth.admins.id
    )
LIMIT 1;

-- 8.3 Configuración inicial de comisiones y tarifas globales
INSERT INTO fin.rates_config (commission_percentage, base_fare_usd, indexed_to_dollar, updated_by)
SELECT 1000, 150, FALSE, id
FROM auth.admins
WHERE role = 'super_admin'
    AND NOT EXISTS (SELECT 1 FROM fin.rates_config)
LIMIT 1;

-- 8.4 Tasa de cambio inicial (ejemplo VES)
INSERT INTO fin.exchange_rates (currency, rate, effective_date)
VALUES ('VES', 36.50, CURRENT_DATE)
ON CONFLICT (currency, effective_date) DO NOTHING;

-- 8.5 Asociación de ejemplo (para desarrollo y pruebas)
INSERT INTO auth.associations (id, name, rif, admin_id)
SELECT uuidv7(), 'Cooperativa Bolivariana', 'J-12345678-9', id
FROM auth.admins WHERE role = 'super_admin' LIMIT 1
ON CONFLICT (rif) DO NOTHING;

-- 8.6 Tarifario de ejemplo para la asociación creada
INSERT INTO fin.coop_fares (association_id, name, base_amount_usd, exchange_rate_id, surcharge_normal, surcharge_student, surcharge_elderly)
SELECT 
    a.id, 
    'Tarifa estándar 2026', 
    150,
    er.id, 
    0,
    -50,
    -30
FROM auth.associations a
CROSS JOIN fin.exchange_rates er
WHERE a.rif = 'J-12345678-9' AND er.currency = 'VES' AND er.effective_date = CURRENT_DATE
ON CONFLICT (association_id, name) DO NOTHING;


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================