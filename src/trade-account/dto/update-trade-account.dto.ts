import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateTradeAccountDto {
  @ApiProperty({
    description: 'Name of the trading account',
    example: 'My Updated Trading Account',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  accountName?: string;

  @ApiProperty({
    description: 'Name of the broker',
    example: 'Zerodha',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  brokerName?: string;

  @ApiProperty({
    description: 'Activate or deactivate the account',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'MT5 Login ID for auto-sync',
    required: false,
    example: '12345678'
  })
  @IsString()
  @IsOptional()
  mt5Login?: string;

  @ApiProperty({ 
    description: 'MT5 Password for auto-sync',
    required: false,
    example: 'mysecretpass'
  })
  @IsString()
  @IsOptional()
  mt5Password?: string;

  @ApiProperty({ 
    description: 'MT5 Server name for auto-sync',
    required: false,
    example: 'MetaQuotes-Demo'
  })
  @IsString()
  @IsOptional()
  mt5Server?: string;
}
