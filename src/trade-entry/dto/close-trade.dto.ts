import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsNotEmpty, ValidateIf, IsArray, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TradeResult } from './create-trade-entry.dto';

export class CloseTradeFieldValueDto {
    @ApiProperty({ description: 'Template field ID' })
    @IsString()
    @IsNotEmpty()
    fieldId: string;

    @ApiProperty({ description: 'Text value', required: false })
    @IsString()
    @IsOptional()
    textValue?: string;

    @ApiProperty({ description: 'Boolean value', required: false })
    @IsBoolean()
    @IsOptional()
    booleanValue?: boolean;

    @ApiProperty({ description: 'Image URL', required: false })
    @IsString()
    @IsOptional()
    imageUrl?: string;
}

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

    @ApiProperty({
        description: 'Dynamic field values from log template',
        type: [CloseTradeFieldValueDto],
        required: false,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CloseTradeFieldValueDto)
    @IsOptional()
    fieldValues?: CloseTradeFieldValueDto[];
}
