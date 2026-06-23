// src/modules/auth/domain/interfaces/repositories/association.repository.port.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * AssociationRepositoryPort — Puerto de Repositorio de Asociaciones
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para el repositorio de asociaciones/cooperativas.
 *
 * Métodos:
 *   - findById(id):     busca por UUID
 *   - findByRif(rif):   busca por RIF (registro fiscal, único)
 *   - save(association): persiste la asociación
 *
 * Capa: Dominio (auth) — Puerto de salida
 *
 * @module AssociationRepositoryPort
 * @see ASSOCIATION_REPOSITORY_PORT
 */

import { Association } from '../../entities';

export const ASSOCIATION_REPOSITORY_PORT = 'ASSOCIATION_REPOSITORY_PORT';

export interface AssociationRepositoryPort {
  findById(id: string): Promise<Association | null>;
  findByRif(rif: string): Promise<Association | null>;
  save(association: Association): Promise<Association>;
}
