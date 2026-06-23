import { UserRole, UserCategory } from '../../domain/entities/user.entity';

export class CreateUserDto {
  phone: string;
  email?: string;
  password: string;
  fullName: string;
  cedula?: string;
  role: UserRole;
  category: UserCategory;
}
