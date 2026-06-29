# `src/` — Código Fuente del API

Capa principal del backend BOLO. Organización basada en **Arquitectura Hexagonal (Puertos y Adaptadores)** con NestJS.

## Estructura de 4 capas por módulo

```
src/
├── shared/                 # Código transversal compartido
├── modules/
│   ├── auth/               # Autenticación y usuarios
│   ├── fin/                # Billetera digital, tarifas, transacciones
│   ├── ops/                # Rutas, vehículos, asignaciones
│   ├── trip/               # Viajes, GPS, pagos
│   └── audit/              # Logs inmutables de auditoría
├── main.ts                 # Punto de entrada de la aplicación
├── app.module.ts           # Módulo raíz de NestJS
├── app.controller.ts       # Controlador raíz (healthcheck)
├── app.service.ts          # Servicio raíz
└── health.controller.ts    # Healthcheck con Terminus
```

### Estado de módulos

| Módulo | Estado |
|--------|--------|
| shared | ✅ Capa completa |
| auth   | ✅ Completo |
| fin    | 🔄 En progreso |
| ops    | 🔄 En progreso |
| trip   | ⏳ Pendiente |
| audit  | ⏳ Pendiente |

### Capas de la arquitectura hexagonal

- **Interfaces** — Controladores REST, DTOs de validación, guards, decoradores
- **Application** — Casos de uso, puertos de entrada/salida, DTOs internos
- **Domain** — Entidades, value objects, repositorios (puertos), excepciones de dominio
- **Infrastructure** — Implementaciones concretas: TypeORM, JWT, Redis, logger, servicios externos
