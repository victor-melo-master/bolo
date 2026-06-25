// src/modules/fin/application/dto/create-coop-fare.dto.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateCoopFareDto — DTO de Creación de Tarifario de Cooperativa
 * ═══════════════════════════════════════════════════════════════
 *
 * Objeto de transferencia de datos para crear un nuevo tarifario.
 * Todos los montos se expresan en centavos (enteros, no flotantes).
 *
 * Capa: Aplicación (fin/dto)
 *
 * @module CreateCoopFareDto
 */

// ─── Importaciones ───
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsUUID,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateCoopFareDto {
  @IsString() // Debe ser string
  @IsNotEmpty() // No puede estar vacío
  name: string; // Nombre descriptivo del tarifario (ej: "Tarifa estándar 2026")

  @IsInt() // Debe ser entero (los montos están en centavos)
  @Min(0) // No puede ser negativo
  baseAmountUsd: number; // Precio base en centavos de USD

  @IsUUID() // Debe ser un UUID válido
  exchangeRateId: string; // ID de la tasa de cambio de referencia

  @IsOptional() // Opcional: si no se envía, se usará 0
  @IsInt()
  surchargeNormal?: number; // Recargo/descuento para pasajeros normales (centavos)

  @IsOptional()
  @IsInt()
  surchargeStudent?: number; // Recargo/descuento para estudiantes (centavos)

  @IsOptional()
  @IsInt()
  surchargeElderly?: number; // Recargo/descuento para adultos mayores (centavos)
}
