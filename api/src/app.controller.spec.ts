// src/app.controller.spec.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * AppController — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el controlador raíz retorne "Hello World!".
 * Utiliza Test.createTestingModule para crear un módulo NestJS mínimo
 * sin necesidad de arrancar el servidor HTTP.
 *
 * @module test/app.controller.spec
 */

import { Test, TestingModule } from '@nestjs/testing';  // Utilidad de NestJS para crear módulos de testing aislados
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    // Se compila un módulo de testing con solo el controlador y su servicio (sin infraestructura real)
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    // Se obtiene la instancia del controlador desde el contenedor de inyección de dependencias del módulo de testing
    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // Se verifica que el método getHello() del controlador retorne el mensaje esperado
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
