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

// Se importa la entidad Association para tipar las operaciones del repositorio
import { Association } from '../../entities';

// Token de DI para identificar este puerto en el contenedor de NestJS
export const ASSOCIATION_REPOSITORY_PORT = 'ASSOCIATION_REPOSITORY_PORT';

// Puerto del repositorio de asociaciones/cooperativas. Aísla la lógica de persistencia del dominio.
export interface AssociationRepositoryPort {
  // Busca una asociación por su UUID. Retorna null si no se encuentra.
  findById(id: string): Promise<Association | null>;
  // Busca por RIF (Registro de Información Fiscal), identificador único fiscal en Venezuela.
  findByRif(rif: string): Promise<Association | null>;
  // Guarda la asociación: crea o actualiza según si ya existe el registro.
  save(association: Association): Promise<Association>;
}
