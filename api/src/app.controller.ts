// src/app.controller.ts
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

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
