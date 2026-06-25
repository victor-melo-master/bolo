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

// ─── Importaciones de NestJS ───
import { Controller, Get } from '@nestjs/common'; // @Controller: decorador de clase para definir un controlador REST; @Get: decorador de método para GET
import { AppService } from './app.service'; // AppService: lógica del endpoint raíz, inyectada por constructor

// @Controller() sin argumento de prefijo: todas las rutas de este controlador cuelgan de la raíz (GET /)
@Controller()
export class AppController {
  // Inyección de dependencias por constructor: AppService se resuelve automáticamente desde el contenedor IoC de NestJS
  // `private readonly` crea e inicializa la propiedad this.appService automáticamente
  constructor(private readonly appService: AppService) {}

  // @Get() sin ruta adicional: asocia este método al verbo HTTP GET en la ruta raíz (GET /)
  @Get()
  getHello(): string {
    // Delega la lógica al servicio en lugar de implementarla directamente en el controlador
    // Esto mantiene el controlador como un adaptador delgado (thin controller) y la lógica reutilizable
    return this.appService.getHello();
  }
}
