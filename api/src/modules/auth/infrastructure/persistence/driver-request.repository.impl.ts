// src/modules/auth/infrastructure/persistence/driver-request.repository.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * DriverRequestRepositoryImpl — Repositorio de Solicitudes (TypeORM)
 * ═══════════════════════════════════════════════════════════════
 *
 * Adaptador concreto del puerto DriverRequestRepositoryPort.
 * Persiste y recupera solicitudes de afiliación de conductores
 * en la tabla auth.driver_requests mediante TypeORM.
 *
 * Capa: Infraestructura (auth/persistence)
 *
 * @module DriverRequestRepositoryImpl
 * @see DriverRequestRepositoryPort
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverRequestRepositoryPort } from '../../domain/interfaces/repositories/driver-request.repository.port';
import { DriverRequest } from '../../domain/entities/driver-request.entity';
import { DriverRequestOrmEntity } from '../orm/driver-request.orm-entity';

@Injectable()
export class DriverRequestRepositoryImpl implements DriverRequestRepositoryPort {
  constructor(
    // @InjectRepository inyecta el repositorio TypeORM para DriverRequestOrmEntity,
    // registrado por TypeOrmModule.forFeature en auth.module.ts. Permite usar
    // los métodos estándar de TypeORM (find, save, etc.) sin implementar SQL.
    @InjectRepository(DriverRequestOrmEntity)
    private readonly driverRequestRepository: Repository<DriverRequestOrmEntity>,
  ) {}

  // save: recibe una entidad de dominio DriverRequest, la convierte a ORM,
  // la persiste y retorna la entidad de dominio resultante con los valores
  // generados por BD (createdAt, id si se asignó en BD, etc.).
  async save(request: DriverRequest): Promise<DriverRequest> {
    const ormRequest = this.toOrm(request);
    const savedOrm = await this.driverRequestRepository.save(ormRequest);
    return this.toDomain(savedOrm);
  }

  // findById: busca una solicitud por su UUID. Retorna null si no se encuentra
  // para que el caso de uso pueda manejarlo (lanzar excepción o continuar).
  async findById(id: string): Promise<DriverRequest | null> {
    const ormRequest = await this.driverRequestRepository.findOne({
      where: { id },
    });
    return ormRequest ? this.toDomain(ormRequest) : null;
  }

  // findByDriverAndAssociation: busca una solicitud por la combinación de
  // conductor y asociación. Útil para evitar solicitudes duplicadas: un
  // mismo conductor no debe poder enviar múltiples solicitudes a la misma
  // cooperativa. También usado en el flujo de aprobación/rechazo.
  async findByDriverAndAssociation(
    driverId: string,
    associationId: string,
  ): Promise<DriverRequest | null> {
    const ormRequest = await this.driverRequestRepository.findOne({
      where: { driverId, associationId },
    });
    return ormRequest ? this.toDomain(ormRequest) : null;
  }

  // ─── Mapeo DriverRequest → DriverRequestOrmEntity (dominio → ORM) ───
  // Copia cada campo de la entidad de dominio a la entidad ORM. La
  // asignación manual garantiza que cambios en una no afecten a la otra
  // sin actualizar explícitamente este mapper.
  private toOrm(request: DriverRequest): DriverRequestOrmEntity {
    const ormRequest = new DriverRequestOrmEntity();
    ormRequest.id = request.id;
    ormRequest.driverId = request.driverId;
    ormRequest.associationId = request.associationId;
    ormRequest.status = request.status;
    ormRequest.documentsUrls = request.documentsUrls;
    ormRequest.rejectionReason = request.rejectionReason;
    return ormRequest;
  }

  // ─── Mapeo DriverRequestOrmEntity → DriverRequest (ORM → dominio) ───
  // Construye una entidad de dominio pasando cada campo posicionalmente
  // al constructor. El orden debe coincidir con la definición de la
  // entidad de dominio DriverRequest.
  private toDomain(orm: DriverRequestOrmEntity): DriverRequest {
    return new DriverRequest(
      orm.id,
      orm.driverId,
      orm.associationId,
      orm.status,
      orm.documentsUrls,
      orm.rejectionReason,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
