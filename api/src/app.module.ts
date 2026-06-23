import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { typeOrmConfig } from './shared/infrastructure/database/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    // Module,
    // FinModule,
    // TripModule,
    // AuditModule,
  ],
})
export class AppModule {}
