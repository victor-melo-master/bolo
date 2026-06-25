// fin/application/dto/create-coop-fare.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsUUID,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateCoopFareDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  baseAmountUsd: number;

  @IsUUID()
  exchangeRateId: string;

  @IsOptional()
  @IsInt()
  surchargeNormal?: number;

  @IsOptional()
  @IsInt()
  surchargeStudent?: number;

  @IsOptional()
  @IsInt()
  surchargeElderly?: number;
}
