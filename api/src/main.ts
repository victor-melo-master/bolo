// src/main.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * BOLO API — Punto de Entrada (Bootstrap)
 * ═══════════════════════════════════════════════════════════════
 *
 * Arranca la aplicación NestJS en el puerto especificado (por defecto 3000).
 * Carga variables de entorno desde `dotenv` antes de inicializar el contenedor
 * de IoC para que todas las dependencias (TypeORM, JWT, etc.) tengan acceso a
 * las configuraciones de forma temprana.
 *
 * Capa: Infraestructura (bootstrap)
 * Dependencias:
 *   - @nestjs/core: creación del contenedor IoC/DI
 *   - AppModule: módulo raíz que importa todos los submódulos funcionales
 *
 * @module main
 */

import 'dotenv/config'; // Carga .env ANTES que nada para que todas las variables de entorno estén disponibles desde el inicio
import { NestFactory } from '@nestjs/core'; // Fábrica que crea y configura la aplicación NestJS
import { AppModule } from './app.module'; // Módulo raíz que orquesta todos los submódulos funcionales

async function bootstrap() {
  // Se crea la aplicación compilando AppModule y resolviendo todo el árbol de dependencias
  const app = await NestFactory.create(AppModule);
  // Se inicia el servidor HTTP en el puerto definido en PORT, o 3000 si no está definido
  await app.listen(process.env.PORT ?? 3000);
}
// Se ejecuta la función bootstrap para arrancar la aplicación
bootstrap();
