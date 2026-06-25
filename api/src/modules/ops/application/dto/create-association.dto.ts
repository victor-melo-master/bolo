// src/modules/ops/application/dto/create-association.dto.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateAssociationDto — DTO para la creación de asociaciones
 * ═══════════════════════════════════════════════════════════════
 *
 * Define la estructura y validaciones de los datos de entrada
 * para el caso de uso CreateAssociationUseCase.
 *
 * Los campos obligatorios son name y rif (RIF venezolano).
 * address y phone son opcionales.
 *
 * Capa: Aplicación (ops)
 *
 * @module CreateAssociationDto
 */

// ─── Importaciones ───

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

// ─── DTO ───

export class CreateAssociationDto {
  @IsString() // Debe ser un string
  @IsNotEmpty() // No puede estar vacío
  name: string; // Nombre legal de la asociación/cooperativa

  @IsString()
  @IsNotEmpty()
  rif: string; // RIF (Registro de Información Fiscal) de la asociación

  @IsOptional() // Campo opcional
  @IsString()
  address?: string; // Dirección fiscal o física de la asociación

  @IsOptional()
  @IsString()
  phone?: string; // Número de teléfono de contacto
}
