import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverRequestRepositoryPort } from '../../domain/interfaces/repositories/driver-request.repository.port';
import { DriverRequest } from '../../domain/entities/driver-request.entity';
import { DriverRequestOrmEntity } from '../orm/driver-request.orm-entity';

@Injectable()
export class DriverRequestRepositoryImpl implements DriverRequestRepositoryPort {
  constructor(
    @InjectRepository(DriverRequestOrmEntity)
    private readonly driverRequestRepository: Repository<DriverRequestOrmEntity>,
  ) {}

  async save(request: DriverRequest): Promise<DriverRequest> {
    const ormRequest = this.toOrm(request);
    const savedOrm = await this.driverRequestRepository.save(ormRequest);
    return this.toDomain(savedOrm);
  }

  async findById(id: string): Promise<DriverRequest | null> {
    const ormRequest = await this.driverRequestRepository.findOne({
      where: { id },
    });
    return ormRequest ? this.toDomain(ormRequest) : null;
  }

  async findByDriverAndAssociation(
    driverId: string,
    associationId: string,
  ): Promise<DriverRequest | null> {
    const ormRequest = await this.driverRequestRepository.findOne({
      where: { driverId, associationId },
    });
    return ormRequest ? this.toDomain(ormRequest) : null;
  }

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
