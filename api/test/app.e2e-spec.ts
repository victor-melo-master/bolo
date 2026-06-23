// test/app.e2e-spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * App E2E Test — Test End-to-End del Controlador Raíz
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el endpoint raíz (GET /) responda con 200 y
 * el mensaje "Hello World!".
 *
 * Usa TestingModule de NestJS para crear una instancia real
 * de la aplicación con todos los módulos importados.
 *
 * @module test/app.e2e-spec
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
