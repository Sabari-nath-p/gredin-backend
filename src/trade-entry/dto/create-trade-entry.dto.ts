import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsNumber,
    IsOptional,
    IsDateString,
    ValidateIf,
    IsArray,
    IsBoolean,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export enum TradeDirection {
    BUY = 'BUY',
    SELL = 'SELL',
}

export enum TradeStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
}

export enum TradeResult {
    PROFIT = 'PROFIT',
    LOSS = 'LOSS',
    BREAK_EVEN = 'BREAK_EVEN',
}

export class TradeFieldValueDto {
    @ApiProperty({ description: 'Template field ID' })
    @IsString()
    @IsNotEmpty()
    fieldId: string;

    @ApiProperty({ description: 'Text value (for TEXT / LONG_TEXT fields)', required: false })
    @IsString()
    @IsOptional()
    textValue?: string;

    @ApiProperty({ description: 'Boolean value (for CHECKBOX fields)', required: false })
    @IsBoolean()
    @IsOptional()
    booleanValue?: boolean;

    @ApiProperty({ description: 'Image URL (for IMAGE fields)', required: false })
    @IsString()
    @IsOptional()
    imageUrl?: string;
}

export class CreateTradeEntryDto {
    @ApiProperty({
        description: 'Trade account ID',
        example: 'uuid-of-trade-account',
    })
    @IsString()
    @IsNotEmpty()
    tradeAccountId: string;

    @ApiProperty({
        description: 'Date and time of the trade entry',
        example: '2026-01-03T10:30:00Z',
    })
    @IsDateString()
    @IsNotEmpty()
    entryDateTime: string;

    @ApiProperty({
        description: 'Name of the stock/instrument',
        example: 'AAPL',
    })
    @IsString()
    @IsNotEmpty()
    instrument: string;

    @ApiProperty({
        description: 'Trade direction',
        enum: TradeDirection,
        example: TradeDirection.BUY,
    })
    @IsEnum(TradeDirection)
    @IsNotEmpty()
    direction: TradeDirection;

    @ApiProperty({
        description: 'Entry price of the stock (optional)',
        example: 150.25,
        required: false,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(0)
    entryPrice?: number;

    @ApiProperty({
        description: 'Quantity of stock purchased (optional)',
        example: 10,
        required: false,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    positionSize?: number;

    @ApiProperty({
        description: 'Stop loss amount (maximum acceptable loss)',
        example: 100.0,
    })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    stopLossAmount: number;

    @ApiProperty({
        description: 'Take profit amount (expected profit)',
        example: 200.0,
    })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    takeProfitAmount: number;

    @ApiProperty({
        description: 'Status of the trade',
        enum: TradeStatus,
        example: TradeStatus.OPEN,
        default: TradeStatus.OPEN,
    })
    @IsEnum(TradeStatus)
    @IsOptional()
    status?: TradeStatus;

    @ApiProperty({
        description: 'Result of the trade (required if status is CLOSED)',
        enum: TradeResult,
        example: TradeResult.PROFIT,
        required: false,
    })
    @ValidateIf((o) => o.status === TradeStatus.CLOSED)
    @IsEnum(TradeResult)
    @IsNotEmpty()
    result?: TradeResult;

    @ApiProperty({
        description: 'Realised profit or loss amount (required if status is CLOSED)',
        example: 150.0,
        required: false,
    })
    @ValidateIf((o) => o.status === TradeStatus.CLOSED)
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    realisedProfitLoss?: number;

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
        description: 'Additional notes about the trade',
        example: 'Strong breakout pattern observed',
        required: false,
    })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({
        description: 'Dynamic field values from log template',
        type: [TradeFieldValueDto],
        required: false,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TradeFieldValueDto)
    @IsOptional()
    fieldValues?: TradeFieldValueDto[];
}
