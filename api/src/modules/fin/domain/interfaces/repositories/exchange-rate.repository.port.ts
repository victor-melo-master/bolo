// src/modules/fin/domain/interfaces/repositories/exchange-rate.repository.port.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * ExchangeRateRepositoryPort — Puerto de Repositorio de Tipos de Cambio
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para la persistencia de tasas de cambio.
 * findCurrent() retorna la tasa vigente entre dos monedas.
 *
 * Capa: Dominio (fin)
 *
 * @module ExchangeRateRepositoryPort
 */

import { ExchangeRate } from '../../entities/exchange-rate.entity';

export const EXCHANGE_RATE_REPOSITORY_PORT = 'ExchangeRateRepositoryPort';

export interface ExchangeRateRepositoryPort {
  findCurrent(from: string, to: string): Promise<ExchangeRate | null>;
  findById(id: string): Promise<ExchangeRate | null>;
  save(rate: ExchangeRate): Promise<ExchangeRate>;
}
