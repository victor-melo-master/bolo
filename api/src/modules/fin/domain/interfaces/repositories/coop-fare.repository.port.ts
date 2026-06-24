// src/modules/fin/domain/interfaces/repositories/coop-fare.repository.port.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CoopFareRepositoryPort — Puerto de Repositorio de Tarifas
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para la persistencia de tarifas por cooperativa.
 *
 * Capa: Dominio (fin)
 *
 * @module CoopFareRepositoryPort
 */

import { CoopFare } from '../../entities/coop-fare.entity';

export const COOP_FARE_REPOSITORY_PORT = 'CoopFareRepositoryPort';

export interface CoopFareRepositoryPort {
  findById(id: string): Promise<CoopFare | null>;
  findByCooperativeId(cooperativeId: string): Promise<CoopFare | null>;
  save(fare: CoopFare): Promise<CoopFare>;
  update(id: string, fare: Partial<CoopFare>): Promise<CoopFare>;
}
