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
  save(coopFare: CoopFare): Promise<CoopFare>;
  findByAssociationId(associationId: string): Promise<CoopFare[]>;
}
