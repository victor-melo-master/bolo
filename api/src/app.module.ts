import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { typeOrmConfig } from './shared/infrastructure/database/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    // Module,
    // FinModule,
    // TripModule,
    // AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
