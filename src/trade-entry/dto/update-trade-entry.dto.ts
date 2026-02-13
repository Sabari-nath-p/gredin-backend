import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTradeEntryDto {
    @ApiProperty({
        description: 'Date and time of the trade entry',
        example: '2026-01-03T10:30:00Z',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    entryDateTime?: string;

    @ApiProperty({
        description: 'Name of the stock/instrument',
        example: 'AAPL',
        required: false,
    })
    @IsString()
    @IsOptional()
    instrument?: string;

    @ApiProperty({
        description: 'Entry price of the stock',
        example: 150.25,
        required: false,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(0)
    entryPrice?: number;

    @ApiProperty({
        description: 'Quantity of stock purchased',
        example: 10,
        required: false,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    positionSize?: number;

    @ApiProperty({
        description: 'Stop loss amount',
        example: 100.0,
        required: false,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(0)
    stopLossAmount?: number;

    @ApiProperty({
        description: 'Take profit amount',
        example: 200.0,
        required: false,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(0)
    takeProfitAmount?: number;

    @ApiProperty({
        description: 'Additional notes',
        example: 'Updated trade notes',
        required: false,
    })
    @IsString()
    @IsOptional()
    notes?: string;
}
