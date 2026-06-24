// src/modules/fin/application/dto/create-wallet.dto.ts
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  @IsIn(['USD', 'VES'])
  currency?: string;
}
