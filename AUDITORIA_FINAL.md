# INFORME FINAL DE AUDITORÍA — SEGURIDAD, CALIDAD Y ARQUITECTURA
## Proyecto BOLOS — Plataforma de Transporte de Pasajeros

**Auditor:** CTO / Arquitecto de Software Líder
**Fecha:** 1 de julio de 2026
**Estándares:** ISO 27001, OWASP Top 10 (2021), CIS Benchmarks
**Estado del proyecto:** 🟡 En desarrollo — ~32% avance global — **NO apto para producción**

---

## 1. Resumen Ejecutivo

BOLOS presenta una **arquitectura hexagonal sólida** con buenas prácticas (per-session JWT keys, bcrypt, redes Docker segmentadas, ValidationPipe con whitelist), pero se encuentra en etapa temprana (~32% de avance) y contiene **vulnerabilidades críticas que requieren acción inmediata antes de continuar desarrollo**.

Este documento consolida y extiende tres rondas de análisis:
- **Ronda 1** (AUDITORIA_SEGURIDAD_CALIDAD_BOLOS.md): Auditoría general fundacional
- **Ronda 2** (README_HALLAZGOS.md): 14 hallazgos nuevos no cubiertos en Ronda 1
- **Ronda 3** (Análisis profundo API / Frontend / Infraestructura): Escaneo detallado por capa

**Hallazgos totales únicos identificados: 45+**
- **Críticos:** 6
- **Altos:** 9
- **Medios:** 14
- **Bajos:** 8
- **Observaciones:** 8+

---

## 2. Matriz DOFA

| **DEBILIDADES** | **OPORTUNIDADES** |
|-----------------|-------------------|
| - Módulos `trip` y `audit` sin implementar (0% avance) | - Arquitectura hexagonal lista para microservicios |
| - Rate limiting en login 100 req/min (anula protección global) | - UUID v7 nativo permite ordenamiento temporal |
| - Billetera sin depósitos/retiros/sagas | - PostGIS integrado para geolocalización |
| - JWT en localStorage (XSS permanent) + console.log del token | - Stack moderno (Node.js 24, NestJS 11, React 19) |
| - Dockerfile production ejecuta `nest start --watch` (dev mode) | - Per-session JWT keys en tabla auth.sessions |
| - Secrets en disco con permisos 644 (world-readable) | - Control de concurrencia optimista en wallets |
| - Sin auditoría regulatoria | - Esquemas separados facilitan migración a microservicios |
| - CORS hardcoded a localhost | - Helmet + ValidationPipe global configurados |
| - Go middleware es stub sin funcionalidad real | - OCC (optimistic concurrency control) en wallets |
| - PGAdmin expuesto en puerto 5050 con .pgpass world-readable | - Triggers de inmutabilidad en transactions y audit_log |

| **FORTALEZAS** | **AMENAZAS** |
|----------------|--------------|
| - JWT con claves por sesión (per-session keys) | - Ataques de fuerza bruta con rate limiting actual |
| - Validaciones personalizadas (teléfono venezolano, cédula/pasaporte) | - XSS vía localStorage compromete todas las sesiones |
| - Guards de roles implementados correctamente | - Fuga de datos sensibles en respuestas de API |
| - Helmet + ValidationPipe global configurados | - Transacciones financieras sin rollback/compensación |
| - Soft delete implementado en usuarios | - Incumplimiento regulatorio sin auditoría |
| - bcrypt con costo 10 para contraseñas | - Contraseñas débiles (`admin123`) en seed de BD |
| - 37 spec files, ~3879 líneas de test | - Dependencia de middleware Go no implementado |
| - Docker secrets para gestión de credenciales | - Exposición de API directa sin WAF |
| - Redes Docker segmentadas con mínimo privilegio | - Secretos en repositorio (riesgo de commit accidental) |
| - Value objects (Phone, Email, Money) con validación de dominio | - Redis sin TLS permite eavesdropping en tráfico de caché |

---

## 3. PORCENTAJE DE AVANCE POR MÓDULO

| Módulo | Avance | Funcionalidades clave faltantes |
|--------|--------|-------------------------------|
| **auth** | **85%** | 2FA/MFA, recuperación de contraseña, verificación email/teléfono |
| **ops** | **40%** | Gestión de conductores, vehículos, asignación de rutas, reportes |
| **fin** | **25%** | Depósitos, retiros, sagas de transacciones, comisiones BOLOS, pasarelas de pago |
| **trip** | **5%** | Entidades de dominio, tracking GPS, WebSockets, pagos por viaje, calificaciones |
| **audit** | **5%** | Repositorio, triggers INSERT-only, endpoints de consulta, exportación regulatoria |
| **middleware (Go)** | **5%** | Proxy reverso, validación JWT, rate limiting distribuido, validación HMAC QR |

**Global:** ~32%

---

## 4. INVENTARIO COMPLETO DE HALLAZGOS

### 4.1 Hallazgos Críticos (6)

| ID | Hallazgo | Capa | OWASP | Archivo | Descripción |
|----|----------|------|-------|---------|-------------|
| **C01** | Dockerfile production ejecuta `nest start --watch` | Infra | A05:2021 | `api/Dockerfile:52` | El stage `production` corre TypeScript compiler + `--watch` (dev mode). El contenedor no arranca correctamente o lo hace con dependencias innecesarias. **Solución:** `CMD ["dumb-init", "node", "dist/main.js"]` |
| **C02** | JwtModule con secret placeholder `'unused'` | API | A02:2021 | `auth.module.ts:107-109` | El módulo JWT se registra con secret dummy. Si alguien usa `@Inject(JwtService)` sin override, firmará tokens inválidos/inseguros. **Solución:** Documentar error si se usa directamente |
| **C03** | Token JWT en localStorage (accesible vía XSS) | Frontend | A05:2021 | `authStore.ts:31-55` | Zustand persist escribe token en localStorage. Un XSS (reflejado, stored, DOM-based) extrae el token permanentemente. **Solución:** Migrar a httpOnly cookies |
| **C04** | Secrets en disco con permisos 644 world-readable | Infra | A05:2021 | `secrets/*.txt` | Todos los secretos (DB password, JWT keys, etc.) tienen permisos 644 — cualquier proceso en el contenedor los lee. **Solución:** `chmod 600` y montar con `--secret` |
| **C05** | Seed de BD con contraseña débil hardcoded | API/DB | A07:2021 | `database/init.sql` | El super admin se crea con password `'admin123'`. En producción, la seed contiene credenciales predecibles. **Solución:** Generar hash dinámico en primer arranque |
| **C06** | PGAdmin expuesto en puerto 5050 con .pgpass en texto plano | Infra | A05:2021 | `postgres/pgpass:1`, `docker-compose.yml` | PGAdmin accesible externamente, archivo `.pgpass` tiene contraseña PostgreSQL en texto plano y permisos 644. **Solución:** Deshabilitar PGAdmin en producción o asegurar con VPN |

### 4.2 Hallazgos Altos (9)

| ID | Hallazgo | Capa | OWASP | Archivo |
|----|----------|------|-------|---------|
| **A01** | Rate limiting login configurado a 100 req/min (anula global 5/min) | API | A01:2021 | `admin-auth.controller.ts:64`, `passenger-auth.controller.ts:74` |
| **A02** | console.log del token JWT en useLogin hook | Frontend | A05:2021 | `useLogin.ts:35` |
| **A03** | Cambio de contraseña no revoca sesiones existentes | API | A07:2021 | `change-admin-password.use-case.ts`, `change-passenger-password.use-case.ts` |
| **A04** | AllExceptionsFilter existe pero NO está registrado globalmente | API | A05:2021 | `main.ts` (no invoca `app.useGlobalFilters()`) |
| **A05** | Frontend sin Content Security Policy (CSP) ni security headers | Frontend | A05:2021 | `nginx.conf` (sin CSP, HSTS, X-Frame-Options, X-Content-Type-Options) |
| **A06** | Redis sin TLS — tráfico de caché en texto plano | Infra | A02:2021 | `redis.client.ts:60` |
| **A07** | Mass assignment por spread operator en DTO → entidad | API | A01:2021 | `update-passenger.use-case.ts:55-60`, `update-admin.use-case.ts:54-57` |
| **A08** | World-readable `.pgpass` con contraseña PostgreSQL en texto plano | Infra | A02:2021 | `postgres/pgpass` (permisos 644, password `mi_super_password_postgres_123`) |
| **A09** | `associationId` no incluido en JWT payload para admin | API | A01:2021 | `login-admin.use-case.ts:75-81` — el controller espera `req.user.associationId` |

### 4.3 Hallazgos Medios (14)

| ID | Hallazgo | Capa | Archivo |
|----|----------|------|---------|
| **M01** | Sin cleanup de sesiones huérfanas (crecimiento infinito de tabla) | API | `session.orm-entity.ts` |
| **M02** | JWT sin verificación de `iss`, `aud`, `typ` | API | `jwt.strategy.ts:82-90` |
| **M03** | Wallet creation fail silencioso — pasajero registrado sin wallet | API | `create-passanger.use-case.ts:89-98` |
| **M04** | Sin refresh tokens — tokens de 24h sin renovación | API | `login-admin.use-case.ts:85` |
| **M05** | CORS hardcoded a `http://localhost:5173` | API | `main.ts:48-52` |
| **M06** | Sin sanitización XSS — campos como `fullName` sin escape | API/Frontend | Múltiples use-cases |
| **M07** | TOCTOU race condition en operaciones de wallet | API | `wallet.repository.ts` (lectura-modificación-escritura sin lock) |
| **M08** | Categoría de pasajero auto-seleccionable sin verificación (`student`/`elderly`) | API | `create-passenger.dto.ts:53-56` |
| **M09** | `associationId` en DTO de creación permite al creator auto-asignarse asociación | API | `create-admin.dto.ts:59-61` |
| **M10** | Variables de entorno en `docker-compose.yml` en texto plano (DB_PASSWORD, JWT_SECRET) | Infra | `docker-compose.yml` |
| **M11** | JWTStrategy decodifica payload antes de verificar firma | API | `jwt.strategy.ts:63-65` |
| **M12** | No hay límite de sesiones activas por usuario | API | `login.use-case.ts` |
| **M13** | Sin healthcheck TypeORM — API reporta healthy sin BD | API/Infra | `health.controller.ts` |
| **M14** | Wallet controller puede carecer de autenticación vs otros controllers | API | `wallet.controller.ts:32-38` |

### 4.4 Hallazgos Bajos (8)

| ID | Hallazgo | Capa | Archivo |
|----|----------|------|---------|
| **L01** | Secretos no `.gitignored` explícitamente — riesgo de commit accidental | Infra | `.gitignore` |
| **L02** | Sin E2E tests a pesar de existir configuración | QA | `api/test/jest-e2e.json` |
| **L03** | Go middleware es stub (solo `/` y `/health`) sin funcionalidad real | Infra | `middleware/main.go:9-28` |
| **L04** | Mensajes de error en login pueden facilitar user enumeration | API | `login.use-case.ts` |
| **L05** | Sin logs estructurados JSON (logging middleware usa texto plano) | API | `logging.middleware.ts` |
| **L06** | Sin tests de integración, E2E, carga, ni seguridad | QA | General |
| **L07** | Sin documentación de API (Swagger/OpenAPI) | API | `main.ts` |
| **L08** | Sin monitoreo (Prometheus/Grafana) ni alertas | Infra | General |

---

## 5. MAPA DE CALOR POR CAPA

```
API ──────────────────────────────────────────────────────────
  auth       ████████████████████████████████████░░░░  85%
  ops        ████████████████░░░░░░░░░░░░░░░░░░░░░░  40%
  fin        ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  25%
  trip       ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   5%
  audit      ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   5%

FRONTEND ─────────────────────────────────────────────────────
  auth UI    ██████████████████████████████████░░░░  85%
  shared     ██████████████████████████████████░░░░  80%
  pages      ██████████████░░░░░░░░░░░░░░░░░░░░░░  40%
  styles     ████████████████████████████████████░  90%

INFRAESTRUCTURA ──────────────────────────────────────────────
  Docker     ██████████████████████████████████░░░  85%
  secrets    ██████████████████░░░░░░░░░░░░░░░░░░  50%
  middleware ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   5%
  monitoring ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%

SEGURIDAD ─────────────────────────────────────────────────────
  críticos   ██████████████████████████████████████  (6 abiertos)
  altos      ██████████████████████████████████████  (9 abiertos)
  medios     ██████████████████████████████████████  (14 abiertos)
  bajos      ██████████████████████████████████████  (8 abiertos)
  corregidos ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  (0)
```

---

## 6. CLASIFICACIÓN POR OWASP TOP 10 (2021)

| OWASP ID | Categoría | Hallazgos | Severidad máxima |
|----------|-----------|-----------|-----------------|
| **A01:2021** | Broken Access Control | C04, A01, A07, A09, M08, M09, M14 | **Crítico** |
| **A02:2021** | Cryptographic Failures | C03, A06, A08, M04, M11 | **Crítico** |
| **A03:2021** | Injection | M06 | **Medio** |
| **A04:2021** | Insecure Design | C06, M03, M07, M12 | **Crítico** |
| **A05:2021** | Security Misconfiguration | C01, C02, C03, C05, A02, A04, A05, M05, M10 | **Crítico** |
| **A06:2021** | Vulnerable Components | (No analizado — requiere SBOM) | — |
| **A07:2021** | Identification & Auth Failures | A03, M01, M02, L04 | **Alto** |
| **A08:2021** | Software & Data Integrity | M03, L03 | **Medio** |
| **A09:2021** | Security Logging & Monitoring | L05, L08 | **Bajo** |
| **A10:2021** | Server-Side Request Forgery | (No identificado) | — |

---

## 7. ÁRBOLES DE DECISIÓN

### 7.1 Priorización de Corrección

```
HALLAZGO IDENTIFICADO
│
├─ ¿Crítico o Alto?
│  ├─ SÍ → ¿Afecta autenticación/autorización?
│  │  ├─ SÍ → CORREGIR EN < 24h (C01-C06, A01-A04)
│  │  └─ NO → CORREGIR EN < 72h (A05-A09)
│  └─ NO → Continuar
│
├─ ¿Medio?
│  ├─ ¿Afecta integridad de datos?
│  │  ├─ SÍ → CORREGIR EN < 1 semana (M03, M07)
│  │  └─ NO → PLANIFICAR EN SPRINT (M01-M02, M04-M06, M08-M14)
│  └─ NO → Continuar
│
├─ ¿Bajo?
│  └─ AGREGAR A BACKLOG (L01-L08)
│
└─ ¿Requiere cambio arquitectónico?
   ├─ SÍ → DISEÑAR RFC antes de implementar
   └─ NO → CORREGIR directamente
```

### 7.2 Despliegue a Producción — Gate Check

```
¿SOLICITAR DESPLIEGUE A PRODUCCIÓN?
│
├─ CHECK 1: ¿Todos los críticos corregidos?
│  ├─ NO → BLOQUEADO (deben cerrarse C01-C06)
│  └─ SÍ → Continuar
│
├─ CHECK 2: ¿Todos los altos corregidos?
│  ├─ NO → BLOQUEADO (deben cerrarse A01-A09)
│  └─ SÍ → Continuar
│
├─ CHECK 3: ¿Tests de seguridad (OWASP ZAP/Burp) pasan?
│  ├─ NO → BLOQUEADO
│  └─ SÍ → Continuar
│
├─ CHECK 4: ¿Módulo trip + fin funcionales al 100%?
│  ├─ NO → BLOQUEADO (core del negocio incompleto)
│  └─ SÍ → Continuar
│
├─ CHECK 5: ¿Middleware Go implementado?
│  ├─ NO → BLOQUEADO (API expuesta sin gateway)
│  └─ SÍ → Continuar
│
├─ CHECK 6: ¿Pentesting externo completado?
│  ├─ NO → BLOQUEADO
│  └─ SÍ → Continuar
│
└─ ✅ DESPLIEGUE AUTORIZADO
```

### 7.3 Respuesta a Incidente de Seguridad

```
INCIDENTE DETECTADO
│
├─ ¿Tipo?
│  ├─ XSS / Token compromise → 
│  │   1. Revocar todas las sesiones (auth.sessions.isActive=false)
│  │   2. Rotar JWT secret global
│  │   3. Forzar re-login a todos los usuarios
│  │   4. Analizar logs de acceso
│  │
│  ├─ Fuerza bruta exitosa →
│  │   1. Bloquear IP atacante (firewall)
│  │   2. Resetear contraseña del usuario comprometido
│  │   3. Revocar todas sus sesiones
│  │   4. Activar rate limiting estricto (2 req/min)
│  │
│  ├─ Fuga de datos (DB leak) →
│  │   1. Rotar todas las credenciales (DB, JWT, Redis)
│  │   2. Notificar a usuarios afectados (LOPD)
│  │   3. Forense de logs de BD
│  │   4. Reportar a autoridades regulatorias
│  │
│  └─ Ataque a billetera/transacciones →
│    1. Congelar wallets involucradas
│    2. Revisar cadena de transacciones
│    3. Backup forense de BD
│    4. Contactar asesoría legal
│
└─ POST-INCIDENTE:
   ├─ Reporte post-mortem (5 Why's)
   ├─ Actualizar playbook
   └─ Implementar controles preventivos
```

---

## 8. ROADMAP DE CORRECCIÓN

### Fase 0: `Stop the Bleeding` (Semana 1 — 5 días)

| Día | Hallazgos | Esfuerzo | Acción |
|-----|-----------|----------|--------|
| Lunes | C01 + A01 | 30 min | Corregir Dockerfile CMD + rate limiting login |
| Martes | C03 + A02 | 30 min | console.log + iniciar migración localStorage → httpOnly cookie |
| Miércoles | C04 + C06 + A08 | 1 h | Permisos secrets/*.txt (600), deshabilitar PGAdmin, asegurar .pgpass |
| Jueves | C02 + A04 + M05 | 1 h | Documentar JwtModule placeholder, registrar AllExceptionsFilter, CORS dinámico |
| Viernes | C05 + A03 + A09 | 2 h | Seed dinámico, revocar sesiones en cambio password, incluir associationId en JWT |

### Fase 1: Endurecimiento (Semanas 2-3)

| Semana | Hallazgos | Esfuerzo |
|--------|-----------|----------|
| Semana 2 | A05 (CSP/headers), A06 (Redis TLS), A07 (mass assignment), M06 (XSS sanitization) | 3 días |
| Semana 3 | M01 (cleanup sesiones), M02 (JWT validation), M04 (refresh tokens plan), M07 (TOCTOU race) | 4 días |

### Fase 2: Correcciones estructurales (Semanas 4-6)

| Semana | Hallazgos | Esfuerzo |
|--------|-----------|----------|
| Semana 4 | M08 (verificación categoría), M09 (associationId DTO), M10 (env vars), M11 (JWT decode before verify) | 3 días |
| Semana 5 | M12 (límite sesiones), M13 (healthcheck DB), M14 (wallet auth) | 2 días |
| Semana 6 | L01-L08 (bajos y observaciones) | 2 días |

### Fase 3: Completar módulos core (Semanas 7-20)

*Ver roadmap en AUDITORIA_SEGURIDAD_CALIDAD_BOLOS.md → Fases 2-5*

---

## 9. COMPARATIVA DE REPORTES

| Aspecto | Informe Anterior (Ronda 1) | Ronda 2 (README_HALLAZGOS) | Ronda 3 (Análisis profundo) |
|---------|---------------------------|---------------------------|----------------------------|
| Tests | "38+ tests" | 37 spec files, ~3879 líneas | Confirmado |
| Rate limiting | Menciona 100 req/min | Identifica que controladores **sobrescriben** global 5/min | Mismo hallazgo |
| JWT | Menciona falta iss/aud | Detecta JwtModule secret dummy + associationId faltante | Confirma + detecta decode before verify |
| Frontend | **No cubre** | Token en localStorage, console.log token | + CSP faltante, nginx sin headers |
| Dockerfile | **No cubre** | CMD incorrecto en production | + Secrets 644, .pgpass world-readable |
| Secrets | Menciona Docker secrets positivamente | Secrets no .gitignored | + 644 permissions, env vars en docker-compose |
| Infraestructura | **No cubre** | **No cubre** | Redis sin TLS, PGAdmin expuesto, seed débil |
| Business logic | **No cubre** | Wallet creation fail silencioso | + Mass assignment, TOCTOU, categoría auto-seleccionable |
| Observaciones | O1-O4 (healthcheck, E2E, middleware, gitignore) | **No cubre** | + Sin logging estructurado, sin monitoreo |

---

## 10. MÉTRICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| Líneas backend (src/) | ~11,960 |
| Líneas tests (spec files) | ~3,879 |
| Archivos de test | 37 |
| Módulos implementados (con código) | 3 de 5 |
| Módulos funcionales completos | 0 de 5 |
| Cobertura de tests | Desconocida |
| Endpoints implementados | ~18 (5 controladores) |
| Vulnerabilidades críticas | 6 |
| Vulnerabilidades altas | 9 |
| Vulnerabilidades medias | 14 |
| Vulnerabilidades bajas | 8 |
| Vulnerabilidades corregidas | 0 |
| Hallazgos totales | 37+ |
| Días estimados de corrección (críticos+altos) | ~10 días |
| Días estimados de corrección (todos) | ~25 días |

---

## 11. PLAYBOOK DE RESPUESTA RÁPIDA

### Si ocurre un breach ahora mismo:

```bash
# 1. Revocar todas las sesiones activas
docker exec -it bolo-api psql -U bolo -d bolo -c \
  "UPDATE auth.sessions SET is_active = false WHERE is_active = true;"

# 2. Rotar secretos
for f in secrets/*.txt; do
  openssl rand -hex 32 > "$f"
  chmod 600 "$f"
done

# 3. Forzar cambio de contraseñas de super_admin
docker exec -it bolo-api psql -U bolo -d bolo -c \
  "UPDATE auth.admins SET password_hash = '' WHERE role = 'super_admin';"

# 4. Habilitar rate limiting estricto
docker exec -it bolo-api psql -U bolo -d bolo -c \
  "UPDATE auth.config SET value = '2' WHERE key = 'login_rate_limit';"

# 5. Aislar red
docker network disconnect bolo_network bolo-api
docker network connect isolated_network bolo-api
```

---

## 12. CONCLUSIÓN Y RECOMENDACIONES

### Estado actual: 🟡 **EN DESARROLLO — NO APTO PARA PRODUCCIÓN**

**Fortalezas que preservar:**
- Arquitectura hexagonal con separación clara de capas
- Per-session JWT keys en base de datos
- Value objects con validación de dominio
- bcrypt con costo 10
- ValidationPipe con whitelist + forbidNonWhitelisted
- Helmet activado globalmente
- Redes Docker segmentadas
- OCC en wallets con versión

**Riesgos que mitigar inmediatamente (esta semana):**
1. Dockerfile CMD incorrecto → el contenedor no arranca en producción
2. JWT en localStorage → cualquier XSS compromete todas las sesiones
3. Secrets world-readable → cualquier proceso interno accede a credenciales
4. Rate limiting 100 req/min → fuerza bruta trivial
5. console.log(token) → exposición del token en DevTools

**Recomendación al CEO:**
1. **Congelar nuevas features por 1 semana** para corregir los 6 críticos y 9 altos
2. **Plan de 5 meses** para MVP complete: Semana 1 (seguridad) + Semanas 2-6 (correcciones) + Semanas 7-20 (módulos core)
3. **Pentesting externo** antes de producción (presupuesto estimado: $5K-$15K)
4. **Contratar QA dedicado** para tests de integración, E2E, carga y seguridad
5. **Validar cumplimiento regulatorio** con asesoría legal venezolana antes de operar

---

**Firmado:**  
CTO / Arquitecto de Software Líder  
BOLOS Transport Platform  
1 de julio de 2026

*Documento consolidado que reemplaza y extiende AUDITORIA_SEGURIDAD_CALIDAD_BOLOS.md y README_HALLAZGOS.md*
