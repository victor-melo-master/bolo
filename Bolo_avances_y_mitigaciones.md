# 📋 Informe Completo de Trabajo

**Fecha:** 1 de julio de 2026  
**Proyecto:** BOLOS — Plataforma de Transporte de Pasajeros  
**Rama de trabajo:** `feat/go-gateway-jwt-proxy`  
**Objetivo:** Mitigar vulnerabilidades de seguridad detectadas en auditorías previas, implementar el API Gateway en Go, y robustecer el módulo de autenticación.

---

## 1. Resultados Generales

| Indicador | Cantidad |
|-----------|----------|
| Hallazgos corregidos | 19 |
| Hallazgos mitigados | 2 (riesgo reducido, no eliminado) |
| Falsos positivos confirmados | 2 |
| Vulnerabilidades críticas activas | 0 |
| Vulnerabilidades altas activas | 2 |
| Vulnerabilidades medias activas | 8 |
| Vulnerabilidades bajas activas | 2 |

> **Resumen:** Se logró eliminar todas las vulnerabilidades críticas, reducir significativamente la superficie de ataque y desplegar un API Gateway funcional con validación de JWT, rate limiting y manejo seguro de cookies.

---

## 2. Correcciones Implementadas por Capa

### 🧱 Infraestructura (Docker, secretos, redes)

| Hallazgo | Riesgo Original | Corrección Aplicada |
|----------|-----------------|---------------------|
| **C04** — Secretos con permisos 644 (world-readable) | Cualquier proceso en el host o contenedor podía leer las credenciales | Se ajustaron los permisos a `600` (`chmod 600 secrets/*.txt`). Solo el propietario puede leer los archivos. |
| **C05** — Contraseña `admin123` hardcoded en el seed de la base de datos | La contraseña del superadmin estaba escrita en texto plano en `database/init.sql` y se versionaba en el repositorio | Se eliminó el `INSERT` con la contraseña fija. Ahora la contraseña se inyecta mediante la variable de entorno `SEED_ADMIN_PASSWORD` leída desde el archivo `.env` (no versionado). El script `01-seed.sh` la usa para crear el admin inicial. |
| **C06** — PGAdmin expuesto y archivo `.pgpass` con contraseña en texto plano | PGAdmin accesible externamente; credenciales de PostgreSQL en texto plano en un archivo con permisos 644 | Se eliminó el archivo `postgres/pgpass`. Se quitó el montaje de `pgadmin-servers.json` en el contenedor. PGAdmin se levanta únicamente con el perfil `tools` (`docker compose --profile tools up`), escuchando solo en `127.0.0.1:5050`. |
| **A08** — Archivo `.pgpass` world-readable (duplicado conceptual con C06) | Fuga de credenciales PostgreSQL | El archivo fue eliminado junto con C06. |
| **A01** — Rate limiting de login a 100 req/min (sobrescribía el límite global de 5/min) | Permitía ataques de fuerza bruta al endpoint de login | Se corrigió el decorador `@Throttle` en los controladores de login para mantener 5 req/min, igual que el límite global. Además, se implementó rate limiting en el middleware Go con Redis como almacenamiento compartido (5 req/min por IP en todas las rutas `/api`). |
| **M10** (mitigación parcial) — Variables de entorno en `docker-compose.yml` en texto plano | Exposición de configuración sensible en el repositorio | Las contraseñas se leen ahora desde archivos de Docker Secrets (`*_FILE`). Las variables no sensibles permanecen, pero las credenciales ya no están en texto plano en el compose. |

---

### 🌐 Middleware Go — API Gateway

**Antes:** El middleware era un stub con solo dos endpoints (`/` y `/health`). No tenía funcionalidad real.  
**Ahora:** Es un API Gateway completo que actúa como punto único de entrada a la API NestJS.

| Funcionalidad Implementada | Detalle |
|----------------------------|---------|
| **Proxy inverso** | Todas las peticiones a `http://middleware:8080/api/*` se reenvían a `http://api:3000/*` (recortando el prefijo `/api`). |
| **Validación de JWT** | El token se extrae del header `Authorization: Bearer <token>` o de la cookie httpOnly `token`. Se valida la firma usando la clave de sesión almacenada en Redis (con fallback a PostgreSQL). |
| **Soporte de cookies httpOnly** | El middleware lee el JWT desde la cookie `token` si no está presente en el header. Así se elimina la necesidad de almacenar el token en el frontend (mitigación de C03). |
| **Inyección de headers de seguridad** | Una vez validado el token, se añaden los headers `X-User-Id`, `X-User-Role`, `X-Session-Id` y se reinyecta `Authorization: Bearer <token>` para que la API NestJS funcione sin cambios. |
| **Rate limiting con Redis** | Usando la librería `redis_rate`, se limita a 5 peticiones por minuto por IP en todas las rutas `/api`. El estado se comparte vía Redis. |
| **Honeypot de Railway** | Se añaden headers falsos (`server: railway`, `x-railway-request-id`, etc.) para confundir a atacantes que realicen fingerprinting de la infraestructura. |
| **CORS con credenciales** | Se permite el origen `http://localhost:5173` con `Access-Control-Allow-Credentials: true` para que el navegador envíe la cookie en peticiones cross-origin. |
| **Healthcheck propio** | Endpoint `/health` para que Docker Compose pueda monitorear el gateway. |
| **Conexiones con reintentos** | Redis y PostgreSQL se conectan con hasta 5 reintentos (espera de 2 s entre intentos) para tolerar arranques lentos. |
| **Lectura de secretos desde archivos** | Las contraseñas se leen desde las variables `*_FILE` (compatibles con Docker Secrets) o directamente de variables de entorno. |
| **Validación de claims JWT (M02)** | El middleware ahora exige que el token contenga `iss: "bolo-api"` y `aud: "bolo-client"`. Esto evita que tokens de otros emisores o audiencias sean aceptados. |

---

### 🖥️ Backend — NestJS

#### 🔐 Autenticación y Sesiones

| Hallazgo | Riesgo Original | Corrección Implementada |
|----------|-----------------|-------------------------|
| **C02** — `JwtModule` registrado con `secret: 'unused'` | Si algún código usaba el `JwtService` sin pasar un secreto explícito, el token se firmaba con `'unused'`, siendo trivial de falsificar | Se cambió el secreto por defecto a `''` (cadena vacía). Cualquier intento de firmar un token sin pasar un secret lanzará un error inmediato. |
| **A03** — Cambio de contraseña no revocaba sesiones activas | Un atacante que obtuvo la contraseña antigua podía seguir usando sesiones existentes incluso después del cambio de contraseña | En los casos de uso `ChangePassengerPasswordUseCase` y `ChangeAdminPasswordUseCase` se agregó la llamada a `sessionRepo.deactivateAllForUser()`, que ahora también elimina las claves de Redis correspondientes. |
| **M01** — Sin limpieza de sesiones expiradas | La tabla `auth.sessions` crecía indefinidamente con sesiones expiradas pero aún marcadas como activas | Se creó el servicio `SessionCleanupService` con una tarea programada (`@Cron`) que ejecuta `deactivateExpired()` cada hora. |
| **M12** — Sin límite de sesiones activas por usuario | Un usuario podía acumular sesiones ilimitadas, aumentando el riesgo de uso indebido | Se implementó un límite: 1 sesión activa para `phone`, 5 para `web/tablet`. Al iniciar sesión, si se supera el límite se eliminan las sesiones más antiguas. |
| **L04** — Mensajes de error en login permitían enumeración de usuarios | Los mensajes distinguían entre "usuario no encontrado", "contraseña incorrecta" y "usuario inactivo" | Todos los errores de login ahora devuelven el mismo mensaje genérico: "Credenciales inválidas". |
| **M02** — JWT sin claims `iss`, `aud`, `typ` | El token carecía de contexto de emisor y audiencia, pudiendo ser reutilizado en otros entornos | Los casos de uso de login ahora añaden `iss: 'bolo-api'`, `aud: 'bolo-client'` y `typ: 'at+jwt'` al payload del JWT. |

#### 🛡️ Protección de Endpoints y Datos

| Hallazgo | Riesgo | Corrección |
|----------|--------|------------|
| **A04** — `AllExceptionsFilter` no registrado globalmente | Las excepciones no atrapadas exponían stack traces y detalles internos del servidor | Se registró el filtro en `main.ts` con `app.useGlobalFilters(new AllExceptionsFilter())`. Ahora todos los errores devuelven un JSON estructurado sin información sensible. |
| **A07** — Mass assignment por spread operator | Al actualizar un usuario, un atacante podría inyectar campos no permitidos si el DTO no estuviera estrictamente validado | Los casos de uso `UpdatePassengerUseCase` y `UpdateAdminUseCase` ahora asignan explícitamente cada campo editable, sin usar `...restDto`. |
| **A09** — `associationId` no incluido en el JWT de admin | Los guards de autorización no podían verificar la pertenencia a una asociación directamente desde el token | Se añadió `associationId: admin.associationId ?? null` al payload JWT en `LoginAdminUseCase`. |

#### 🔁 Otros

| Cambio | Motivo |
|--------|--------|
| Inyección de Redis en `SessionRepositoryImpl` | Para eliminar las claves de Redis cuando se desactiva una sesión (necesario para C03 y A03). |
| `RedisClient` ahora lee la contraseña desde archivo secreto | Para que la API pueda conectarse a Redis autenticado. |
| Creación de wallet automática corregida | Se mejoró el manejo de errores en `CreatePassengerUseCase` para que no falle silenciosamente si la wallet no puede crearse (aunque la transaccionalidad completa —M03— sigue pendiente). |

---

### 🎨 Frontend

| Hallazgo | Riesgo | Corrección |
|----------|--------|------------|
| **A02** — `console.log` del token JWT en `useLogin.ts` | El token aparecía en la consola del navegador, accesible mediante cualquier extensión o inspección manual | Se eliminó la línea `console.log(token)`. |
| **A05** (parcial) — Falta de security headers en nginx | Sin headers de seguridad, el frontend era vulnerable a clickjacking, MIME sniffing y otros ataques | Se agregaron en `nginx.conf`: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy` y `Content-Security-Policy`. La CSP aún permite `'unsafe-inline'` (pendiente de endurecer). |
| **C03** (mitigado) — Token JWT en localStorage | El token podía ser robado mediante XSS, comprometiendo la sesión | El backend ahora envía el token en una cookie httpOnly. El middleware Go lo extrae de la cookie. El frontend aún persiste el token en el store de Zustand, por lo que la mitigación no es completa. Falta eliminar esa persistencia. |

---

## 3. Hallazgos que No se Modificaron (Pendientes)

| ID | Descripción | Motivo |
|----|-------------|--------|
| **A05** | CSP permite `'unsafe-inline'` | Requiere reescribir estilos/scripts inline (tarea más larga). |
| **A06** | Redis sin TLS | El tráfico entre el middleware y Redis viaja en texto plano dentro de la red `cache_net`. Evaluar si se justifica el costo de configuración en esta etapa. |
| **M03** | Wallet creation no es transaccional | Si el registro del usuario falla, la wallet podría quedar creada (o viceversa). Requiere implementar sagas o transacciones distribuidas. |
| **M04** | Sin refresh tokens | Los tokens de acceso duran 24 h sin posibilidad de renovación silenciosa. |
| **M06** | Sin sanitización XSS en campos de texto | Campos como `fullName` no se sanitizan al guardar ni al mostrar. |
| **M08** | Categoría `student/elderly` auto-seleccionable | Un pasajero puede declararse estudiante o adulto mayor sin verificación documental. |
| **M09** | `associationId` en DTO sin validación de pertenencia | Al crear un admin, se puede asignar cualquier `associationId`. |
| **M10** | Variables de entorno en texto plano (parcial) | Algunas variables no sensibles siguen en `docker-compose.yml`. |
| **M13** | Healthcheck no verifica la base de datos | La API responde healthy incluso si PostgreSQL está caído. |
| **M14** | `WalletController` sin autenticación | Cualquiera puede crear wallets mediante `POST /fin/wallets`. |
| **L01** | Secretos no `.gitignored` explícitamente | Aunque ya están en `.gitignore`, no hay una línea explícita. |
| **N01** | Llamada duplicada a `login()` en `useLogin.ts` | Código redundante. |

---

## 4. Falsos Positivos Identificados

| ID | Hallazgo | Por qué no es una vulnerabilidad real |
|----|----------|----------------------------------------|
| **M07** | TOCTOU race condition en wallet | La entidad `Wallet` usa control de concurrencia optimista (OCC) con un campo `version`. Cada actualización verifica `WHERE version = :versionAnterior`, evitando condiciones de carrera. |
| **M11** | `JwtStrategy` decodifica el JWT antes de verificar la firma | Es una necesidad arquitectónica: el sistema de claves por sesión requiere extraer el `sessionId` del payload para saber con qué clave verificar la firma. La validación real ocurre inmediatamente después, con la clave correcta. |

---

## 5. Próximos Pasos Recomendados

- **🔴 Crítico funcional:** Agregar `@UseGuards(JwtAuthGuard)` a `WalletController` (M14).
- **🟠 Seguridad alta:** Endurecer CSP eliminando `'unsafe-inline'` (A05).
- **🟠 Seguridad alta:** Evaluar configuración de TLS para Redis (A06).
- **🟡 Mitigación completa:** Eliminar el token del localStorage en el frontend y migrar completamente a cookies httpOnly (C03).
- **🟡 Integridad de datos:** Hacer transaccional la creación de wallet (M03).
- **🟢 Funcionalidad:** Implementar verificación documental para categorías especiales de pasajeros (M08).

---

## 6. Notas Finales

- El sistema de claves JWT rotativas por sesión quedó robustecido con invalidación inmediata al cambiar contraseña o al superar el límite de sesiones.
- El API Gateway en Go está completamente operativo y es el punto único de entrada a la API. Sin él, la API no es accesible desde el exterior (puerto 3000 no expuesto).
- La cobertura de tests unitarios sigue siendo buena (37 spec files, ~3879 líneas). Se recomienda añadir tests de integración para los nuevos flujos (gateway, rate limiting, cookies).
- El módulo `fin` (billetera) sigue siendo el punto más débil y requiere atención prioritaria en futuras iteraciones.
