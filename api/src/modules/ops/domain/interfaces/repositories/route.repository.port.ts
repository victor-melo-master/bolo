// src/modules/ops/domain/interfaces/repositories/route.repository.port.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * RouteRepositoryPort — Puerto de repositorio para rutas
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato (interfaz) que debe implementar cualquier
 * infraestructura de persistencia para el agregado Route.
 *
 * Sigue el patrón Port & Adapter (Hexagonal): el dominio declara
 * el puerto, y la capa de infraestructura provee la implementación
 * concreta (adaptador). Esto permite cambiar de ORM/base de datos
 * sin afectar la lógica de negocio.
 *
 * Capa: Dominio (ops)
 *
 * @module RouteRepositoryPort
 */

// ─── Importaciones ───

import { Route } from '../../entities/route.entity';

// ─── Token de Inversión de Dependencias ───

/**
 * Token utilizado por el contenedor NestJS para inyectar la
 * implementación concreta de RouteRepositoryPort.
 * Se usa con @Inject(ROUTE_REPOSITORY_PORT) en los casos de uso.
 */
export const ROUTE_REPOSITORY_PORT = 'ROUTE_REPOSITORY_PORT';

// ─── Puerto del Repositorio ───

/**
 * Interfaz que expone las operaciones de persistencia para Route.
 * El dominio depende de esta abstracción, no de TypeORM ni de ningún ORM.
 */
export interface RouteRepositoryPort {
  /**
   * Persiste una ruta (crea o actualiza según si el id existe).
   * Retorna la ruta guardada con los valores generados por la BD.
   */
  save(route: Route): Promise<Route>;

  /**
   * Busca todas las rutas que pertenecen a una asociación.
   * Útil para listar rutas por cooperativa/asociación.
   */
  findByAssociationId(associationId: string): Promise<Route[]>;

  /**
   * Busca una ruta por su UUID.
   * Retorna null si no existe.
   */
  findById(id: string): Promise<Route | null>;
}
