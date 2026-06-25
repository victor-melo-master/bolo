// src/modules/ops/application/dto/create-route.dto.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateRouteDto — DTO para la creación de rutas
 * ═══════════════════════════════════════════════════════════════
 *
 * Define la estructura y validaciones de los datos de entrada
 * para el caso de uso CreateRouteUseCase.
 *
 * Utiliza decoradores de class-validator para validar en tiempo
 * de ejecución que los datos cumplan con las reglas de formato
 * esperadas (strings no vacías, UUIDs válidos, etc.).
 *
 * Capa: Aplicación (ops)
 *
 * @module CreateRouteDto
 */

// ─── Importaciones ───

import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

// ─── DTO ───

export class CreateRouteDto {
  @IsString() // Debe ser un string
  @IsNotEmpty() // No puede estar vacío
  name: string; // Nombre de la ruta (ej. "Ruta Sur-Oeste")

  @IsOptional() // Campo opcional
  @IsString() // Si se provee, debe ser string
  description?: string; // Descripción detallada de la ruta

  @IsUUID() // Debe ser un UUID v4 válido
  coopFareId: string; // ID del tarifario asociado (fin.coop_fares)
}
