# FLUJOS DE INFORMACIÓN — BOLO API

> Guía visual de cómo viaja la información a través del sistema.
> Ideal para personas no familiarizadas con la arquitectura hexagonal.

> ⚠️ **Nota importante:** Todo el tráfico pasa primero por el **middleware** (Go/Fiber) antes de llegar a la API. Las flechas de estos diagramas asumen que el middleware ya validó el JWT y reenvió la petición.
> Ver [`FLUJOS_MIDDLEWARE.md`](../FLUJOS_MIDDLEWARE.md) para el middleware,
> [`FLUJOS_REDIS.md`](../FLUJOS_REDIS.md) para Redis, y
> [`FLUJOS_POSTGRES.md`](../FLUJOS_POSTGRES.md) para PostgreSQL.

---

## 📌 Anatomía de una Petición

Toda petición sigue la misma ruta a través de la API:

```
                         ┌─ Capa de Infraestructura ─┐
Cliente (App/Web) ──► HTTP ──► Controlador ──► Caso de Uso ──► Puerto (interfaz)
                              (validación)                     │
                                                               ▼
                                                      Implementación ──► Base de Datos
                                                      (TypeORM)         (PostgreSQL)
                         └──────────────────────────────────────────────────────────┘
```

### Paso a paso:

1. **Cliente** (app móvil, web) envía una petición HTTP
2. **Controlador** recibe la petición, valida los datos con DTOs
3. **Caso de Uso** ejecuta la lógica de negocio (usa datos del dominio)
4. **Puerto** (interfaz) abstrae el acceso a datos
5. **Implementación** (TypeORM) traduce a SQL y consulta PostgreSQL
6. **Respuesta** viaja de vuelta por la misma ruta

---

## 🔐 Flujo 1 — Registro de Pasajero

```
App Móvil                      API BOLO                              PostgreSQL
   │                             │                                      │
   │  POST /auth/passengers/     │                                      │
   │  register                   │                                      │
   │  ──────────────────────────►│                                      │
   │                             │  1. Valida datos del formulario      │
   │                             │     (teléfono, contraseña, nombre)   │
   │                             │                                      │
   │                             │  2. ¿Teléfono ya registrado?         │
   │                             │  ──────────────────────────────────► │
   │                             │  ◄── (existe / no existe) ────────── │
   │                             │                                      │
   │                             │  3. Encripta contraseña (bcrypt)     │
   │                             │                                      │
   │                             │  4. Crea registro de pasajero        │
   │                             │  ──────────────────────────────────► │
   │                             │          auth.passengers             │
   │                             │                                      │
   │                             │  5. Crea billetera digital           │
   │                             │     (saldo inicial: $0.00)           │
   │                             │  ──────────────────────────────────► │
   │                             │          fin.wallets                 │
   │                             │                                      │
   │  ◄── 201 Created ───────────│                                      │
```

**Archivos involucrados:**
- `interfaces/rest/passenger-auth.controller.ts` — recibe la petición
- `application/dto/create-passenger.dto.ts` — valida los datos
- `application/use-cases/create-passenger.use-case.ts` — ejecuta la lógica
- `infrastructure/persistence/passenger.repository.impl.ts` — guarda en BD
- `infrastructure/services/wallet.service.impl.ts` — crea la billetera

---

## 🔑 Flujo 2 — Inicio de Sesión

```
App Móvil                      API BOLO                              PostgreSQL
   │                             │                                      │
   │  POST /auth/login           │                                      │
   │  ──────────────────────────►│                                      │
   │                             │  1. Busca usuario por teléfono       │
   │                             │  ──────────────────────────────────► │
   │                             │  ◄── datos del usuario ───────────── │
   │                             │                                      │
   │                             │  2. ¿Usuario activo?                 │
   │                             │  3. ¿Contraseña correcta? (bcrypt)   │
   │                             │                                      │
   │                             │  4. Genera nueva clave JWT única     │
   │                             │                                      │
   │                             │  5. Crea sesión                      │
   │                             │  ──────────────────────────────────► │
   │                             │          auth.sessions               │
   │                             │                                      │
   │  ◄── { token, user } ───────│                                      │
   │                             │                                      │
   │  (usa el token en futuras   │                                      │
   │   peticiones como:          │                                      │
   │   Authorization: Bearer ...)│                                      │
```

**¿Por qué es seguro?**
- Cada login genera una **nueva clave de firma** para el JWT
- Si cierras sesión, tu token anterior ya no sirve
- Las sesiones expiran automáticamente (cada hora se limpian)

---

## 🏢 Flujo 3 — Crear Asociación/Cooperativa

```
Admin Web                     API BOLO                              PostgreSQL
   │                             │                                      │
   │  POST /ops/associations     │                                      │
   │  (JWT + role: super_admin)  │                                      │
   │  ──────────────────────────►│                                      │
   │                             │  1. Verifica JWT (¿quién eres?)      │
   │                             │  2. Verifica rol (¿tienes permiso?)  │
   │                             │                                      │
   │                             │  3. ¿RIF ya registrado?              │
   │                             │  ──────────────────────────────────► │
   │                             │           auth.associations          │
   │                             │                                      │
   │                             │  4. Crea la asociación               │
   │                             │  ──────────────────────────────────► │
   │                             │           auth.associations          │
   │                             │                                      │
   │                             │  5. Asigna admin a la asociación     │
   │                             │  ──────────────────────────────────► │
   │                             │           auth.admins                │
   │                             │                                      │
   │  ◄── 201 Created ───────────│                                      │
```

---

## 🛣️ Flujo 4 — Crear Ruta

```
Admin Web                     API BOLO                              PostgreSQL
   │                             │                                      │
   │  POST /ops/routes           │                                      │
   │  (JWT + role: assoc_admin)  │                                      │
   │  ──────────────────────────►│                                      │
   │                             │  1. Verifica JWT y rol               │
   │                             │                                      │
   │                             │  2. ¿La tarifa pertenece a tu        │
   │                             │     cooperativa?                     │
   │                             │  ──────────────────────────────────► │
   │                             │    auth.associations + fin.coop_fares│
   │                             │                                      │
   │                             │  3. Crea la ruta                     │
   │                             │  ──────────────────────────────────► │
   │                             │           ops.routes                 │
   │                             │                                      │
   │  ◄── 201 Created ───────────│                                      │
```

---

## 💰 Flujo 5 — Crear Tarifario

```
Admin Web                     API BOLO                              PostgreSQL
   │                             │                                      │
   │  POST /fin/coop-fares       │                                      │
   │  (JWT + role: assoc_admin)  │                                      │
   │  ──────────────────────────►│                                      │
   │                             │  1. Verifica JWT y rol               │
   │                             │                                      │
   │                             │  2. ¿Tasa de cambio existe?          │
   │                             │  ──────────────────────────────────► │
   │                             │        fin.exchange_rates            │
   │                             │                                      │
   │                             │  3. ¿Ya existe un tarifario con      │
   │                             │     ese nombre para tu cooperativa?  │
   │                             │  ──────────────────────────────────► │
   │                             │        fin.coop_fares                │
   │                             │                                      │
   │                             │  4. Crea el tarifario (activo)       │
   │                             │  ──────────────────────────────────► │
   │                             │        fin.coop_fares                │
   │                             │                                      │
   │  ◄── 201 Created ───────────│                                      │
```

---

## 🔄 Flujo General de la Información

### Cómo se conectan los módulos

```
               ┌─────────────────────────────────────────────────┐
               │                SHARED (transversal)              │
               │  • CryptoService (bcrypt)    • Redis (caché)     │
               │  • Winston (logs)            • TypeORM config    │
               └─────────────────────────────────────────────────┘
                            ▲           ▲           ▲
                            │           │           │
               ┌────────────┴───┐ ┌────┴────┐ ┌────┴───────────┐
               │    AUTH        │ │   FIN   │ │      OPS        │
               │  • Admins      │ │ • Wallet│ │  • Routes       │
               │  • Passengers  │ │ • Fares │ │  • Associations │
               │  • Sessions    │ │ • Trans.│ │  • (vehículos)  │
               │  • Associations│ │ • Rates │ │                 │
               └────────────────┘ └─────────┘ └─────────────────┘
                         │                │
                         ▼                ▼
               ┌─────────────────────────────────────────────────┐
               │              BASE DE DATOS                      │
               │         PostgreSQL 18 + PostGIS 3               │
               │  auth.admins  │  fin.wallets  │  ops.routes     │
               │  auth.passengers │ fin.coop_fares │              │
               │  auth.sessions │ fin.exchange_rates │            │
               └─────────────────────────────────────────────────┘
```

### Regla de oro: las capas NO se saltan

```
✅ CORRECTO:                      ❌ INCORRECTO:
Controller ──► UseCase            Controller ──► Repository (directo)
                  │                             
                  ▼                             
              Repository                        
```

El **Caso de Uso** siempre es el centro de la lógica. Los controladores solo reciben peticiones y los repositorios solo guardan datos.

---

## 📂 ¿Dónde está cada pieza?

| Qué buscas                          | Lo encuentras en                                                   |
| ----------------------------------- | ------------------------------------------------------------------ |
| Endpoints de la API                 | `src/modules/*/interfaces/rest/*.controller.ts`                    |
| Validación de datos de entrada      | `src/modules/*/interfaces/dto/*.dto.ts`                            |
| Lógica de negocio                   | `src/modules/*/application/use-cases/*.use-case.ts`                |
| Entidades del negocio (puras)       | `src/modules/*/domain/entities/*.entity.ts`                        |
| Interfaces de repositorios          | `src/modules/*/domain/interfaces/repositories/*.repository.port.ts`|
| Implementación de BD                | `src/modules/*/infrastructure/persistence/*.repository.impl.ts`    |
| Mapeo de tablas SQL                 | `src/modules/*/infrastructure/orm/*.orm-entity.ts`                 |
| Seguridad (JWT, guards)             | `src/modules/*/infrastructure/auth/`                               |
| Configuración global                | `src/shared/`                                                      |
| Tests                               | `*.spec.ts` junto al archivo que prueban                           |
