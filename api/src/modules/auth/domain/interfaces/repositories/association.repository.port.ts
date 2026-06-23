// projectBolo/api/src/modules/auth/domain/interfaces/repositories/association.repository.port.ts
import { Association } from '../../entities';

export const ASSOCIATION_REPOSITORY_PORT = 'ASSOCIATION_REPOSITORY_PORT';

export interface AssociationRepositoryPort {
  findById(id: string): Promise<Association | null>;
  findByRif(rif: string): Promise<Association | null>;
  save(association: Association): Promise<Association>;
}
