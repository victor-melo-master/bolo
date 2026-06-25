// ops/application/dto/create-route.dto.ts
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  coopFareId: string;
}
