// src/modules/fin/application/dto/create-wallet.dto.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateWalletDto — DTO de Creación de Billetera
 * ═══════════════════════════════════════════════════════════════
 *
 * Objeto de transferencia de datos para la creación de una billetera.
 * Se valida con class-validator en el pipe de NestJS.
 *
 * Capa: Aplicación (fin/dto)
 *
 * @module CreateWalletDto
 */

// ─── Importaciones ───
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateWalletDto {
  @IsString() // Valida que userId sea un string no vacío
  userId: string;

  @IsOptional() // Campo opcional: si no se envía, se usará 'USD' por defecto
  @IsString() // Solo se valida como string si está presente
  @IsIn(['USD', 'VES']) // Restringe a códigos de moneda soportados
  currency?: string;
}
