// src/modules/auth/infrastructure/auth/not-super-admin.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class NotSuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role === 'super_admin') {
      throw new ForbiddenException(
        'Los super administradores no pueden eliminar su cuenta por este medio.',
      );
    }
    return true;
  }
}
