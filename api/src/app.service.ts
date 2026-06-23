// src/app.service.ts
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

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
