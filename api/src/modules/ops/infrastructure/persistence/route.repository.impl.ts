// src/modules/ops/infrastructure/persistence/route.repository.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * RouteRepositoryImpl — Implementación del puerto de repositorio de rutas
 * ═══════════════════════════════════════════════════════════════
 *
 * Adaptador de infraestructura que implementa RouteRepositoryPort
 * usando TypeORM como motor de persistencia.
 *
 * Traduce entre la entidad de dominio (Route) y la entidad ORM
 * (RouteOrmEntity), manteniendo el dominio aislado de los detalles
 * de la base de datos.
 *
 * Capa: Infraestructura (ops)
 *
 * @module RouteRepositoryImpl
 */

// ─── Importaciones ───

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteRepositoryPort } from '../../domain/interfaces/repositories/route.repository.port';
import { Route } from '../../domain/entities/route.entity';
import { RouteOrmEntity } from '../orm/route.orm-entity';

// ─── Implementación del Repositorio ───

@Injectable()
export class RouteRepositoryImpl implements RouteRepositoryPort {
  constructor(
    @InjectRepository(RouteOrmEntity) // Inyecta el repositorio TypeORM para la entidad RouteOrmEntity
    private readonly ormRepo: Repository<RouteOrmEntity>,
  ) {}

  /**
   * Persiste una ruta (INSERT o UPDATE según si el id existe).
   * Convierte de dominio a ORM, guarda, y retorna la entidad de dominio.
   */
  async save(route: Route): Promise<Route> {
    const orm = this.toOrm(route); // Convierte entidad de dominio → entidad ORM
    const saved = await this.ormRepo.save(orm); // Ejecuta la operación en BD
    return this.toDomain(saved); // Convierte el resultado ORM → entidad de dominio
  }

  /**
   * Busca todas las rutas de una asociación por su UUID.
   * Retorna un arreglo de entidades de dominio (puede estar vacío).
   */
  async findByAssociationId(associationId: string): Promise<Route[]> {
    const ormList = await this.ormRepo.find({ where: { associationId } });
    return ormList.map((orm) => this.toDomain(orm)); // Mapea cada ORM a dominio
  }

  /**
   * Busca una ruta por su UUID.
   * Retorna la entidad de dominio o null si no existe.
   */
  async findById(id: string): Promise<Route | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  /**
   * Convierte una entidad ORM (tipo DB) a una entidad de dominio (tipo negocio).
   * Aísla al dominio de los decoradores y tipos de TypeORM.
   */
  private toDomain(orm: RouteOrmEntity): Route {
    return new Route(
      orm.id,
      orm.associationId,
      orm.name,
      orm.description,
      orm.coopFareId,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  /**
   * Convierte una entidad de dominio a una entidad ORM para persistencia.
   * Crea una nueva instancia de RouteOrmEntity y asigna cada campo.
   */
  private toOrm(route: Route): RouteOrmEntity {
    const orm = new RouteOrmEntity();
    orm.id = route.id;
    orm.associationId = route.associationId;
    orm.name = route.name;
    orm.description = route.description;
    orm.coopFareId = route.coopFareId;
    orm.isActive = route.isActive;
    orm.createdAt = route.createdAt;
    orm.updatedAt = route.updatedAt;
    return orm;
  }
}
