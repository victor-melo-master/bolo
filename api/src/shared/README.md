# `shared/` — Código Transversal

Código compartido entre todos los módulos del API. Proporciona infraestructura base, utilidades y abstracciones reutilizables.

## Capas

```
shared/
├── domain/              # Base para entidades, excepciones, value objects, interfaces de repositorio
├── application/         # Puertos de aplicación, servicios compartidos
├── infrastructure/      # Implementaciones concretas
└── interfaces/          # Decoradores, filtros de excepción, middleware global
```

### Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `infrastructure/CryptoService.ts` | Servicio de encriptación y hashing |
| `infrastructure/WinstonLogger.ts` | Logger estructurado basado en Winston |
| `infrastructure/RedisClient.ts` | Cliente Redis para caché y sesiones |
| `interfaces/AllExceptionsFilter.ts` | Filtro global de excepciones HTTP |
| `infrastructure/typeorm.config.ts` | Configuración de TypeORM para la base de datos |
