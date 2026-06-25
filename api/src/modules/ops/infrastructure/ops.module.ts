// ops/infrastructure/ops.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/infrastructure/auth.module';
import { CreateAssociationUseCase } from '../application/use-cases/create-association.use-case';
import { OpsAssociationController } from '../interfaces/rest/association.controller';

@Module({
  imports: [AuthModule], // Necesita los repositorios de usuarios y asociaciones
  controllers: [OpsAssociationController], // Controlador renombrado
  providers: [CreateAssociationUseCase], // Caso de uso para crear asociación
})
export class OpsModule {}
