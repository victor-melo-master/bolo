# `modules/` — Módulos de Negocio

Cada módulo representa un dominio del negocio y sigue la **arquitectura hexagonal** con 4 capas internas: `domain/`, `application/`, `infrastructure/`, `interfaces/`.

## Módulos

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| auth | ✅ Completo | Autenticación, usuarios, roles, sesiones |
| fin | 🔄 En progreso | Billetera digital, tarifas, transacciones |
| ops | 🔄 En progreso | Rutas, vehículos, asignaciones |
| trip | ⏳ Pendiente | Viajes, GPS, pagos |
| audit | ⏳ Pendiente | Logs inmutables de auditoría |

### Estructura común

```
module/
├── domain/            # Entidades, value objects, puertos de repositorio, excepciones
├── application/       # Casos de uso, DTOs internos, puertos de servicio
├── infrastructure/    # Implementaciones (TypeORM, servicios externos)
└── interfaces/        # Controladores REST, DTOs de validación, guards
```

Cada módulo es independiente y se comunica con otros módulos a través de puertos definidos en `shared/`.
