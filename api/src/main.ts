// src/main.ts
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

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
