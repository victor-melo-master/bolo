// src/app.controller.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * AppController — Controlador Raíz
 * ═══════════════════════════════════════════════════════════════
 *
 * Controlador por defecto de NestJS. Responde en GET / con un mensaje
 * de verificación ("Hello World!"). Sirve como healthcheck básico y
 * punto de partida para el desarrollo.
 *
 * Capa: Interfaces (REST controller)
 * Dependencias:
 *   - AppService: lógica del endpoint raíz
 *
 * @module AppController
 */

import { Controller, Get } from '@nestjs/common';  // Controller = decorador de clase, Get = decorador de método
import { AppService } from './app.service';          // Servicio inyectado para separar lógica del enrutamiento

@Controller()   // @Controller() sin prefijo significa que responde en la raíz (GET /)
export class AppController {
  // Inyección por constructor: AppService se resuelve automáticamente desde el contenedor IoC
  constructor(private readonly appService: AppService) {}

  @Get()        // Decorador que asocia este método al verbo HTTP GET
  getHello(): string {
    // Delega la lógica al servicio, manteniendo el controlador como un adaptador delgado
    return this.appService.getHello();
  }
}
