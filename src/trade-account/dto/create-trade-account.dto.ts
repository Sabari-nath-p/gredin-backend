import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum MarketSegment {
  STOCK = 'STOCK',
  AUCTION = 'AUCTION',
  FUTURES = 'FUTURES',
  OPTIONS = 'OPTIONS',
  FOREX = 'FOREX',
  CRYPTO = 'CRYPTO',
  COMMODITIES = 'COMMODITIES',
}

export enum AccountType {
  DEMO = 'DEMO',
  LIVE = 'LIVE',
  FUNDED = 'FUNDED',
}

export class CreateTradeAccountDto {
  @ApiProperty({
    description: 'Name of the trading account',
    example: 'My Primary Trading Account',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  accountName: string;

  @ApiProperty({
    description: 'Name of the broker',
    example: 'Zerodha',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  brokerName: string;

  @ApiProperty({
    description: 'Market segment for trading',
    enum: MarketSegment,
    example: MarketSegment.STOCK,
  })
  @IsEnum(MarketSegment)
  @IsNotEmpty()
  marketSegment: MarketSegment;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
    default: 'USD',
    maxLength: 3,
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currencyCode?: string;

  @ApiProperty({
    description: 'Initial account balance',
    example: 10000.00,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  initialBalance: number;

  @ApiProperty({
    description: 'Type of trading account',
    enum: AccountType,
    example: AccountType.DEMO,
  })
  @IsEnum(AccountType)
  @IsNotEmpty()
  accountType: AccountType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mt5Login?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mt5Password?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mt5Server?: string;
}
