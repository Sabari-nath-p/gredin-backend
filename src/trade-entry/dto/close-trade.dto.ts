import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsNotEmpty, ValidateIf, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TradeResult } from './create-trade-entry.dto';

export class CloseTradeDto {
    @ApiProperty({
        description: 'Result of the trade',
        enum: TradeResult,
        example: TradeResult.PROFIT,
    })
    @IsEnum(TradeResult)
    @IsNotEmpty()
    result: TradeResult;

    @ApiProperty({
        description: 'Realised profit or loss amount',
        example: 150.0,
    })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    realisedProfitLoss: number;

    @ApiProperty({
        description: 'Service charge/commission',
        example: 10.0,
        default: 0,
        required: false,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(0)
    serviceCharge?: number;

    @ApiProperty({
        description: 'Additional notes about closing the trade',
        example: 'Target achieved',
        required: false,
    })
    @IsString()
    @IsOptional()
    notes?: string;
}
