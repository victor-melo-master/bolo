// src/shared/infrastructure/shared.module.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * SharedModule — Módulo Compartido Global
 * ═══════════════════════════════════════════════════════════════
 *
 * Módulo global (@Global()) que provee servicios, guards y utilidades
 * compartidas a todos los módulos funcionales de la aplicación. Al ser
 * global, no es necesario importarlo explícitamente en cada módulo —
 * NestJS lo registra en el ámbito global del contenedor IoC.
 *
 * Actualmente exporta:
 *   - RolesGuard: guard de control de acceso por roles (@Roles)
 *
 * Capa: Infraestructura (shared) — Módulo global
 * Dependencias:
 *   - RolesGuard: verificación de roles en rutas protegidas
 *
 * @module SharedModule
 */

// ─── Importaciones de NestJS ───
import { Global, Module } from '@nestjs/common'; // Global = ámbito global, Module = definición de módulo
import { RolesGuard } from './auth/roles.guard'; // Guard de verificación de roles para endpoints protegidos

// @Global() hace que los providers de este módulo estén disponibles en todo el árbol de dependencias
// sin necesidad de importar SharedModule en cada submódulo
@Global()
@Module({
  providers: [RolesGuard], // Registra RolesGuard para que el contenedor IoC lo inyecte donde sea necesario
  exports: [RolesGuard], // Exporta RolesGuard para que esté disponible fuera de este módulo
})
export class SharedModule {}
