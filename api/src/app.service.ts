// src/app.service.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * AppService — Servicio Raíz
 * ═══════════════════════════════════════════════════════════════
 *
 * Servicio simple que provee el mensaje de bienvenida del endpoint
 * raíz. Es un placeholder que será reemplazado o ampliado conforme
 * el proyecto madure (ej. redirección a documentación Swagger).
 *
 * Capa: Aplicación (servicio genérico)
 *
 * @module AppService
 */

// ─── Importaciones de NestJS ───
import { Injectable } from '@nestjs/common'; // @Injectable(): registra la clase como provider en el contenedor IoC para inyección de dependencias

// @Injectable() permite que AppService sea inyectado en cualquier controlador u otro servicio de NestJS
@Injectable()
export class AppService {
  // Retorna el mensaje de bienvenida del endpoint raíz
  // Placeholder: en el futuro podría redirigir a documentación Swagger o devolver metadata del sistema
  getHello(): string {
    return 'Hello World!';
  }
}
