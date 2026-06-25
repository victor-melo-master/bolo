import { Global, Module } from '@nestjs/common';
import { RolesGuard } from './auth/roles.guard';

@Global() // Opcional, pero conveniente
@Module({
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class SharedModule {}
