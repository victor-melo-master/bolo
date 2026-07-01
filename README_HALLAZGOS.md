# INFORME DE HALLAZGOS — Auditoría de Seguridad y Calidad
## Proyecto BOLOS — Plataforma de Transporte de Pasajeros

**Auditor:** CTO / Arquitecto de Software Líder
**Fecha:** 1 de julio de 2026
**Estándares:** ISO 27001, OWASP Top 10 (2021), CIS Benchmarks

---

## Resumen Ejecutivo

BOLOS tiene una **arquitectura sólida y buenas prácticas** (hexagonal, JWT por sesión, segregación de redes Docker, bcrypt, validaciones personalizadas), pero el **avance real del MVP es ~32%** y existen **hallazgos críticos que el informe previo no cubrió**. Este documento se enfoca en descubrimientos específicos de mi análisis directo del código fuente.

**Hallazgos nuevos identificados (no reportados previamente):** 14

---

## Hallazgos Críticos No Reportados Anteriormente

### H1: [CRÍTICO] Dockerfile de Producción — CMD Incorrecto
**Archivo:** `api/Dockerfile:52`

```dockerfile
CMD ["dumb-init", "node", "--max-old-space-size=4096", "/app/node_modules/.bin/nest", "start", "--watch"]
```

El stage `production` ejecuta `nest start --watch` en vez de `node dist/main.js`. Esto significa:
- Incluye TypeScript compiler en producción (dependency bloat)
- `--watch` mantiene el proceso en modo desarrollo
- El binario `nest` se ejecuta desde `node_modules` en lugar del compilado en `dist/`
- **Impacto:** El contenedor de producción falla al arrancar o corre en modo dev con dependencias innecesarias

**Solución:** Reemplazar con `CMD ["dumb-init", "node", "dist/main.js"]`

### H2: [CRÍTICO] JwtModule Registrado con Secret Ficticio "unused"
**Archivo:** `api/src/modules/auth/infrastructure/auth.module.ts:107-109`

```typescript
JwtModule.register({
  secret: 'unused',
  signOptions: { expiresIn: '24h' },
})
```

El `JwtModule` se registra con `secret: 'unused'` porque la firma real se hace por session-key en cada caso de uso. Sin embargo, `passport-jwt` con `secretOrKeyProvider` personalizado resuelve la clave dinámicamente. **Esto es confuso y peligroso**: si alguien usa `@Inject(JwtService)` en otro contexto sin pasar `secret`, firmará tokens con `unused`.

**Riesgo:** Falsa sensación de seguridad. Si un desarrollador desconoce el patrón y usa `jwtService.sign()` sin override, los tokens serían inválidos o inseguros.

**Solución:** Documentar explícitamente que este `secret` es placeholder y lanzar error si se usa directamente sin `secret` override. Considerar eliminar la propiedad `secret` si la versión de `@nestjs/jwt` lo permite.

### H3: [CRÍTICO] Frontend — Token JWT Persistido en localStorage (XSS)
**Archivo:** `frontend/src/shared/store/authStore.ts:31-55`

```typescript
persist(
  ...
  { name: "auth-storage", partialize: (state) => ({ token: state.token, user: state.user }) },
)
```

El token JWT se persiste en `localStorage` mediante Zustand persist middleware. Un ataque XSS en el frontend expone el token JWT permanentemente (localStorage es accesible vía `document.cookie` análogo con `localStorage.getItem`).

**Riesgo:** Cualquier vulnerabilidad XSS en React (reflejado, stored, DOM-based) compromete todas las sesiones.

**Solución:** Usar `httpOnly` cookies para el token JWT, o al menos configurar el store con `sessionStorage` (menor ventana de exposición).

### H4: [ALTA] Rate Limiting en Login — Configurado a 100 req/min en Controladores
**Archivo:** `api/src/modules/auth/interfaces/rest/admin-auth.controller.ts:64`

```typescript
@Throttle({ default: { limit: 100, ttl: 60000 } })
```

Y en `passenger-auth.controller.ts:74`:
```typescript
@Throttle({ default: { limit: 100, ttl: 60000 } })
```

El `AppModule` configura `ThrottlerModule` con 5 req/min global, pero ambos controladores de login **sobrescriben** con 100 req/min. Esto anula la protección global.

**Riesgo:** Ataque de fuerza bruta contra login: 100 intentos/minuto × 2 endpoints = 200 intentos/minuto.

**Solución:** Cambiar a `limit: 5` o eliminar el `@Throttle()` en los controladores (heredarían el límite global de 5).

### H5: [ALTA] console.log en Producción — useLogin Hook
**Archivo:** `frontend/src/modules/auth/hooks/useLogin.ts:35`

```typescript
console.log("Token después de login:", useAuthStore.getState().token);
```

El hook `useLogin` imprime el token JWT en consola después de cada login. En producción, logs de consola del navegador quedan accesibles al usuario.

**Riesgo:** Exposición del token JWT a cualquier usuario que abra DevTools. Posible exfiltración por extensiones maliciosas.

**Solución:** Eliminar el `console.log`.

### H6: [ALTA] Cambio de Contraseña — No Revoca Sesiones Existentes
**Archivos:**
- `api/src/modules/auth/application/use-cases/change-admin-password.use-case.ts`
- `api/src/modules/auth/application/use-cases/change-passenger-password.use-case.ts`

Cuando un usuario cambia su contraseña, las sesiones existentes (tokens JWT firmados con claves anteriores) **no se invalidan**. Un atacante con sesión robada retiene acceso incluso después del cambio de contraseña.

**Riesgo:** Si un atacante intercepta un token, la víctima cambia su contraseña, pero el atacante sigue teniendo acceso hasta que el token expire (24h).

**Solución:** Eliminar o desactivar todas las sesiones del usuario (`auth.sessions.isActive = false`) tras el cambio de contraseña.

### H7: [ALTA] AllExceptionsFilter — No está Registrado Globalmente
**Archivo:** `api/src/main.ts`

No se encuentra `app.useGlobalFilters(new AllExceptionsFilter())` en el bootstrap. El filtro global de excepciones existe (`api/src/shared/interfaces/filters/all-exceptions.filter.ts`) pero **nunca se registra**.

**Riesgo:** Excepciones no manejadas retornan el stack trace completo de NestJS/Express al cliente, exponiendo detalles de implementación.

**Solución:** Agregar `app.useGlobalFilters(new AllExceptionsFilter())` en `main.ts`.

### H8: [MEDIA] Sesiones JWT — Sin Mecanismo de Limpieza (orphaned sessions)
**Archivo:** `api/src/modules/auth/infrastructure/orm/session.orm-entity.ts`

Cada login crea una nueva sesión en `auth.sessions` con `isActive = true`. No existe:
1. Un límite máximo de sesiones activas por usuario
2. Un job/cron que expire sesiones vencidas (`expires_at`)
3. Un cleanup de sesiones huérfanas

**Riesgo:** Crecimiento infinito de la tabla `auth.sessions`, degradación de performance. Un usuario puede acumular cientos de sesiones sin límite.

**Solución:** Implementar:
- Capa de 10 sesiones activas por usuario (desactivar la más antigua al exceder)
- `@Cron` job que marque `isActive = false` donde `expires_at < NOW()`
- Índice compuesto para barrido eficiente

### H9: [MEDIA] Validación JWT — Sin Verificación de `iss`, `aud`, `typ`
**Archivo:** `api/src/modules/auth/infrastructure/auth/jwt.strategy.ts:82-90`

El método `validate()` acepta cualquier payload JWT sin verificar:
- **iss (issuer):** No se valida que el emisor sea el sistema BOLOS
- **aud (audience):** No se distingue entre audiencias (admin, passenger, mobile)
- **typ (type):** No se diferencia entre access token y refresh token (cuando existan)

**Riesgo:** Un JWT firmado con una clave de sesión podría ser reutilizado en contextos donde no debería ser válido (ej: un token de pasajero usado como admin).

**Solución:** Agregar verificaciones en `validate()` y en la generación del token incluir `iss`, `aud`, `typ` en el payload.

### H10: [MEDIA] Asociación en JWT Payload — No se Incluye associationId
**Archivo:** `api/src/modules/auth/application/use-cases/login-admin.use-case.ts:75-81`

```typescript
const payload = {
  sub: admin.id,
  phone: admin.phone,
  role: admin.role,
  userType: 'admin',
  sessionId: session.id,
};
```

El `associationId` no se incluye en el payload, pero el controlador de rutas (`route.controller.ts:48-49`) lo extrae de `req.user.associationId`. Como no está en el payload, siempre será `undefined`.

**Riesgo:** La creación de rutas falla para `association_admin` que no es `super_admin`. Funciona solo si el guard no intercepta el error.

**Solución:** Incluir `associationId: admin.associationId` en el payload JWT.

### H11: [MEDIA] Wallet Creation — Falla Silenciosa en Registro de Pasajero
**Archivo:** `api/src/modules/auth/application/use-cases/create-passanger.use-case.ts:89-98`

```typescript
if (this.walletService) {
  try {
    await this.walletService.createWallet(saved.id);
  } catch (error) {
    this.logger.error('Wallet creation failed, continuing passenger registration', error);
  }
}
```

Si la creación de la billetera falla, el pasajero se registra **sin billetera** y el error solo se loggea. No hay compensación.

**Riesgo:** Pasajeros registrados sin billetera, imposibilitados de recibir/ser debitados. El sistema no detecta esta inconsistencia automáticamente.

**Solución:** Hacer la creación de wallet transaccional: o se crea todo o no se crea el pasajero. Considerar patrón saga.

### H12: [MEDIA] No Hay Refresh Token — Tokens de 24h sin Renovación
**Archivo:** `api/src/modules/auth/application/use-cases/login-admin.use-case.ts:85`

```typescript
const accessToken = this.jwtService.sign(payload, {
  secret: jwtKey,
  expiresIn: '24h',
});
```

No existe mecanismo de refresh token. Si un token expira, el usuario debe volver a hacer login completo. Esto es aceptable para MVP pero problemático para UX y seguridad:
- Tokens de 24h aumentan la ventana de exposición si son robados
- No se puede renovar sin credenciales

**Solución:** Implementar refresh tokens con expiración más corta (15-30 min) + refresh token de larga duración (7-30 días). El refresh token debe ser revocable.

### H13: [BAJA] Origen CORS Hardcoded en main.ts
**Archivo:** `api/src/main.ts:48-52`

```typescript
app.enableCors({
  origin: 'http://localhost:5173',
  ...
});
```

El origen CORS está hardcoded. En producción se debe cambiar a `https://app.bolo.com`. Además, en `dev` apunta a `localhost:5173` (Vite) pero el `docker-compose.yml` inyecta `VITE_API_URL=http://localhost:3000`.

**Riesgo:** Error de configuración en producción si se olvida cambiar. Exposición CORS si se despliega con origen de desarrollo.

**Solución:** Leer `CORS_ORIGIN` de variables de entorno con fallback seguro.

### H14: [BAJA] No hay Sanitización Explícita contra XSS/SQLi
**Archivo:** `api/src/modules/auth/application/use-cases/` (todos)

Los casos de uso confían en TypeORM parameterized queries para prevenir SQLi, lo cual es correcto, pero no hay sanitización contra XSS en campos que pueden ser renderizados en el frontend (ej: `fullName`).

**Riesgo:** Un usuario malicioso podría registrar un nombre con `<script>` tags que se ejecuten al renderizar en React.

**Solución:** Implementar sanitización de output en el frontend (DOMPurify) y considerar validación de entrada que rechace HTML tags en campos de texto.

---

## Hallazgos Adicionales de Observabilidad y DevOps

### O1: Sin Healthcheck TypeORM — API Reporta Healthy sin DB
**Archivo:** `api/src/health.controller.ts`

El healthcheck de la API solo verifica que el servidor HTTP responda, no que TypeORM esté conectado a PostgreSQL. Si la BD falla pero el servidor sigue vivo, Docker Compose reporta "healthy".

**Impacto:** Dependencias caídas no detectadas automáticamente.

### O2: Sin E2E Tests Configurados a Pesar del Script
**Archivo:** `api/test/jest-e2e.json`

El archivo de configuración E2E existe, pero no hay tests E2E implementados (el directorio `test/` solo tiene un placeholder). El comando `npm run test:e2e` fallaría o pasaría vacío.

### O3: GO Middleware — Placeholder sin Funcionalidad Real
**Archivo:** `middleware/main.go:9-28`

El API Gateway en Go solo tiene dos endpoints (`/` y `/health`). Zero funcionalidad de:
- Proxy reverso → la API sigue expuesta directamente
- Validación JWT
- Rate limiting distribuido
- HMAC QR validation
- CORS

### O4: Secretos Locales — No .gitignored Explícitamente
**Archivo:** `.gitignore`

Los secretos se generan con `make init` en `secrets/*.txt`. Si bien el `Makefile` los ignora, no hay verificación explícita en CI/CD de que no se hayan commiteado. Una mala práctica de `git add .` podría exponer secretos.

---

## Matriz de Criticidad de Hallazgos

| ID | Hallazgo | Impacto | Probabilidad | Riesgo | Esfuerzo Corrección |
|---|---|---|---|---|---|
| H1 | Dockerfile production CMD incorrecto | Alto | Cierta | **Crítico** | 5 min |
| H2 | JwtModule with dummy secret | Alto | Media | **Crítico** | 30 min |
| H3 | Token JWT en localStorage (XSS) | Alto | Alta | **Crítico** | 1 día |
| H4 | Rate limiting 100 req/min | Alto | Alta | **Alto** | 1 min |
| H5 | console.log del token JWT | Alto | Alta | **Alto** | 1 min |
| H6 | No revoca sesiones al cambiar contraseña | Alto | Media | **Alto** | 2 h |
| H7 | AllExceptionsFilter no registrado | Medio | Alta | **Alto** | 1 min |
| H8 | Sin cleanup de sesiones huérfanas | Medio | Alta | **Medio** | 4 h |
| H9 | JWT sin iss/aud/typ validation | Medio | Baja | **Medio** | 2 h |
| H10 | associationId no incluido en JWT | Alto | Baja | **Medio** | 10 min |
| H11 | Wallet creation failure silencioso | Alto | Baja | **Medio** | 4 h |
| H12 | Sin refresh tokens | Medio | Media | **Medio** | 2 días |
| H13 | CORS hardcoded a localhost | Medio | Alta | **Medio** | 5 min |
| H14 | Sin sanitización XSS | Medio | Baja | **Bajo** | 4 h |

---

## Comparativa con Reportes Anteriores

El informe existente (`AUDITORIA_SEGURIDAD_CALIDAD_BOLOS.md`) es correcto en sus puntos generales pero:

| Aspecto | Informe Anterior | Este Análisis |
|---|---|---|
| Tests unitarios | "38+ tests" | 37 spec files, ~3879 líneas de test |
| Rate limiting login | Menciona 100 req/min pero como parte del problema general | Identifica que **los controladores sobrescriben** el límite global de 5 |
| JWT | Menciona falta de iss/aud | Adicionalmente detecta: JwtModule con secret dummy, falta associationId en payload |
| Seguridad frontend | **No cubre** | Token en localStorage, console.log con token |
| Dockerfile production | **No cubre** | CMD incorrecto, stage production inútil |
| Cleanup sesiones | **No cubre** | Sin límite de sesiones ni job de limpieza |
| Revocación post password change | **No cubre** | Sesiones activas siguen siendo válidas |
| AllExceptionsFilter | Menciona "configurar" | Detecta que existe pero no está registrado |
| Wallet creation transaccional | **No cubre** | Falla silenciosa en createPassenger |
| Refresh tokens | **No cubre** | Sin mecanismo de renovación |

---

## Métricas del Código

| Métrica | Valor |
|---|---|
| Líneas de código backend (src/) | ~11,960 |
| Líneas de tests (spec files) | ~3,879 |
| Archivos de test | 37 |
| Módulos implementados | 3 de 5 (auth, ops, fin) |
| Módulos funcionales completos | 0 de 5 |
| Cobertura de tests | Desconocida (sin reporte) |
| Endpoints implementados | ~18 (en 5 controladores) |
| Configuraciones de seguridad inseguras | 7 identificadas |
| Vulnerabilidades críticas | 5 (H1, H2, H3, H4, H5) |
| Vulnerabilidades altas | 3 (H6, H7, H11) |
| Vulnerabilidades medias | 5 (H8, H9, H10, H12, H13) |
| Vulnerabilidades bajas | 1 (H14) |

---

## Observaciones Finales

**Lo que está bien:**
- Arquitectura hexagonal con clara separación de capas
- Value objects (`Phone`, `Email`, `Money`) con validación de dominio
- Per-session JWT keys en tabla `auth.sessions`
- Redes Docker segmentadas con mínimo privilegio
- bcrypt con costo 10 para contraseñas
- ValidationPipe con whitelist y forbidNonWhitelisted
- Helmet activado globalmente
- Esquemas de BD separados por dominio
- OCC (optimistic concurrency control) en wallets
- Triggers de inmutabilidad en transactions y audit_log

**Lo que requiere atención inmediata (playbook de este mes):**

```
Semana 1:
  LUNES:  H1 (Dockerfile) + H4 (rate limit) = 30 min
  MARTES: H5 (console.log) + H7 (exception filter) = 15 min
  MIÉRCOLES: H13 (CORS dinámico) + H10 (associationId) = 30 min
  JUEVES: H2 (JwtModule secret) + H12 plan refresh token = 2 h
  VIERNES: H3 (localStorage mitigation) = inicio de migración

Semana 2:
  H6 (revocar sesiones post password change) = 2 h
  H8 (cleanup sesiones) = 4 h
  H9 (JWT validation) = 2 h
  H14 (sanitización XSS) = 4 h
```

**Veredicto técnico:** El proyecto tiene una base sólida pero sangra por varios frentes que un análisis superficial no descubre. Los 14 hallazgos aquí documentados requieren acción antes de considerar el sistema listo para staging, y mucho menos producción.

---

*CTO / Arquitecto de Software Líder — BOLOS Transport Platform*
*Este documento debe leerse como complemento al informe general de auditoría existente.*
