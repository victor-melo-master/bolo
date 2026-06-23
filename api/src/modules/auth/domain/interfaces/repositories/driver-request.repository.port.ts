// projectBolo/api/src/modules/auth/domain/interfaces/repositories/driver-request.repository.port.ts
import { DriverRequest } from '../../entities';

export const DRIVER_REQUEST_REPOSITORY_PORT = 'DRIVER_REQUEST_REPOSITORY_PORT';

export interface DriverRequestRepositoryPort {
  findById(id: string): Promise<DriverRequest | null>;
  findByDriverAndAssociation(
    driverId: string,
    associationId: string,
  ): Promise<DriverRequest | null>;
  save(request: DriverRequest): Promise<DriverRequest>;
  // ... filtrar por estado, etc.
}
