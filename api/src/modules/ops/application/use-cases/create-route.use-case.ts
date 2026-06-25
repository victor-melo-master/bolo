// src/modules/ops/application/use-cases/create-route.use-case.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateRouteUseCase — Creación de una nueva ruta operativa
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta el proceso de creación de una ruta validando que:
 *   1. El tarifario (coopFareId) exista y pertenezca a la asociación
 *      del usuario autenticado.
 *   2. Se construya la entidad Route con los datos proporcionados.
 *   3. Se persista la entidad a través del repositorio.
 *
 * Sigue el patrón CQRS: cada caso de uso es un comando atómico.
 * La validación de negocio (pertenencia del tarifario) vive aquí,
 * no en el controlador ni en el repositorio.
 *
 * Capa: Aplicación (ops)
 *
 * @module CreateRouteUseCase
 */

// ─── Importaciones ───

import { ROUTE_REPOSITORY_PORT } from '../../domain/interfaces/repositories/route.repository.port';
import type { RouteRepositoryPort } from '../../domain/interfaces/repositories/route.repository.port';
import { COOP_FARE_REPOSITORY_PORT } from '../../../fin/domain/interfaces/repositories/coop-fare.repository.port';
import type { CoopFareRepositoryPort } from '../../../fin/domain/interfaces/repositories/coop-fare.repository.port';
import { Route } from '../../domain/entities/route.entity';
import { CreateRouteDto } from '../dto/create-route.dto';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';

// ─── Caso de Uso ───

@Injectable()
export class CreateRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY_PORT) // Puerto del repositorio de rutas (inyectado por DI)
    private readonly routeRepo: RouteRepositoryPort,
    @Inject(COOP_FARE_REPOSITORY_PORT) // Puerto del repositorio de tarifarios (módulo fin)
    private readonly coopFareRepo: CoopFareRepositoryPort,
  ) {}

  /**
   * Ejecuta la creación de una ruta.
   *
   * Paso a paso:
   *   1. Obtiene todos los tarifarios de la asociación.
   *   2. Verifica que el coopFareId del DTO exista en esa lista.
   *      Si no existe, lanza BadRequestException (HTTP 400).
   *   3. Construye una nueva instancia de Route mediante el factory method.
   *   4. Persiste y retorna la ruta creada.
   *
   * @param associationId — ID de la asociación (extraído del token JWT)
   * @param dto — Datos validados de la ruta a crear
   * @returns Promise<Route> — La ruta recién creada y persistida
   */
  async execute(associationId: string, dto: CreateRouteDto): Promise<Route> {
    // Validar que el tarifario exista y pertenezca a la misma asociación
    // Esto evita que un usuario asigne un tarifario de otra asociación
    const fares = await this.coopFareRepo.findByAssociationId(associationId);
    const fare = fares.find((f) => f.id === dto.coopFareId);
    if (!fare) {
      throw new BadRequestException(
        'Tarifario no encontrado o no pertenece a tu asociación',
      );
    }

    // Construye la entidad de dominio con los datos del DTO + el associationId del token
    const route = Route.create({
      associationId,
      name: dto.name,
      description: dto.description,
      coopFareId: dto.coopFareId,
    });

    // Persiste la entidad y retorna el resultado (incluye timestamps generados)
    return this.routeRepo.save(route);
  }
}
