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

// ─── Carga de variables de entorno ───
// dotenv/config se importa antes que cualquier otro módulo para que todas las variables
// de entorno (DB_HOST, JWT_SECRET, etc.) estén disponibles desde la inicialización del
// contenedor IoC de NestJS. Sin esto, TypeORM y otros módulos arrancarían sin configuración.
import 'dotenv/config';
// ─── NestJS: fábrica de aplicaciones ───
// NestFactory.create() compila el módulo raíz y construye el árbol de dependencias completo
import { NestFactory } from '@nestjs/core';
// AppModule es el módulo raíz que importa TypeOrmModule, AuthModule, FinModule, OpsModule y ConfigModule
import { AppModule } from './app.module';
//
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AllExceptionsFilter } from './shared/interfaces/filters/all-exceptions.filter';
import { SanitizePipe } from './shared/interfaces/pipes/sanitize.pipe'; // ← nuevo pipe contra XSS

// Función de arranque asíncrona: NestJS requiere async porque la creación del contenedor es asíncrona
async function bootstrap() {
  // NestFactory.create(AppModule) compila el módulo, resuelve dependencias e inicia el servidor HTTP interno
  const app = await NestFactory.create(AppModule);

  // 1. Sanitización de inputs contra XSS (antes que ValidationPipe)
  app.useGlobalPipes(new SanitizePipe());

  // 2. Validación estricta de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos no declarados
      forbidNonWhitelisted: true, // rechaza peticiones con campos extras
      transform: true, // transforma strings a números, etc.
    }),
  );

  // 3. Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. Helmet con seguridad adicional (CSP, HSTS, framing, referrer)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: [
            "'self'",
            process.env.CORS_ORIGINS?.split(',')[0]?.trim() ||
              'http://localhost:5173',
          ],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  // 5. CORS con whitelist explícita
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map((o) =>
    o.trim(),
  ) || ['http://localhost:5173'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin as string) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  // app.listen() inicia el servidor Express/Koa subyacente en el puerto especificado
  // process.env.PORT se define en docker-compose o .env; si no existe, usa 3000 como fallback de desarrollo
  await app.listen(process.env.PORT ?? 3000);
}
// Se invoca bootstrap() al arrancar el proceso; Captura errores no manejados durante el inicio
void bootstrap();
