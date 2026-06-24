// src/modules/fin/domain/interfaces/repositories/saga-state.repository.port.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * SagaStateRepositoryPort — Puerto de Repositorio de Estados Saga
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para la persistencia de pasos de saga.
 * findBySagaId() retorna todos los pasos de una saga para
 * determinar el estado general y ejecutar compensaciones.
 *
 * Capa: Dominio (fin)
 *
 * @module SagaStateRepositoryPort
 */

import { SagaState } from '../../entities/saga-state.entity';

export const SAGA_STATE_REPOSITORY_PORT = 'SagaStateRepositoryPort';

export interface SagaStateRepositoryPort {
  findById(id: string): Promise<SagaState | null>;
  findBySagaId(sagaId: string): Promise<SagaState[]>;
  save(state: SagaState): Promise<SagaState>;
  update(id: string, state: Partial<SagaState>): Promise<SagaState>;
}
