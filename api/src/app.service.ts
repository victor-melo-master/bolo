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

import { Injectable } from '@nestjs/common';  // @Injectable() registra la clase en el contenedor IoC para poder inyectarla

@Injectable()
export class AppService {
  getHello(): string {
    // Placeholder: retorna un mensaje simple. En producción podría redirigir a Swagger o devolver estado
    return 'Hello World!';
  }
}
