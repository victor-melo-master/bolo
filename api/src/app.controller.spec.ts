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

// ─── Importaciones de NestJS Testing ───
import { Test, TestingModule } from '@nestjs/testing'; // Test.createTestingModule: crea un módulo NestJS aislado sin servidor HTTP real
import { AppController } from './app.controller';
import { AppService } from './app.service';

// describe: agrupa tests relacionados con AppController
describe('AppController', () => {
  let appController: AppController; // Instancia del controlador bajo prueba

  // beforeEach: se ejecuta antes de cada test, asegurando un módulo de testing fresco
  beforeEach(async () => {
    // Test.createTestingModule compila un módulo mínimo con solo controlador y provider necesarios
    // No se importa infraestructura real (sin TypeORM, sin Redis), lo que hace el test rápido y aislado
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController], // Controlador a probar
      providers: [AppService], // Servicio que depende el controlador
    }).compile();

    // app.get<T>(Tipo) recupera la instancia del controlador desde el contenedor DI del módulo de testing
    appController = app.get<AppController>(AppController);
  });

  // describe('root'): agrupa tests del endpoint raíz
  describe('root', () => {
    // it define un caso de prueba individual con descripción legible
    it('should return "Hello World!"', () => {
      // expect(..).toBe(..): verifica que el valor retornado sea exactamente el esperado
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
