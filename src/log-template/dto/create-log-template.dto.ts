import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    ArrayNotEmpty,
    ValidateNested,
    IsEnum,
    IsInt,
    Min,
    ValidateIf,
    IsNumber,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FieldType {
    TEXT = 'TEXT',
    LONG_TEXT = 'LONG_TEXT',
    CHECKBOX = 'CHECKBOX',
    IMAGE = 'IMAGE',
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    SCORECARD = 'SCORECARD',
}

export class ScorecardOptionDto {
    @ApiProperty({ description: 'Option label', example: 'Followed plan' })
    @IsString()
    @IsNotEmpty()
    label: string;

    @ApiProperty({ description: 'Option score (0-100)', example: 80, minimum: 0, maximum: 100 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    score: number;
}

export class ScorecardConfigDto {
    @ApiProperty({
        description: 'Question weight percentage (optional). If omitted for all scorecard questions, weights are auto-distributed to sum to 100%.',
        example: 25,
        required: false,
        minimum: 0,
        maximum: 100,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    weight?: number;

    @ApiProperty({ description: 'Answer options', type: [ScorecardOptionDto] })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ScorecardOptionDto)
    options: ScorecardOptionDto[];
}

export class CreateTemplateFieldDto {
    @ApiProperty({ description: 'Field name/label', example: 'Strategy Used' })
    @IsString()
    @IsNotEmpty()
    fieldName: string;

    @ApiProperty({ description: 'Field type', enum: FieldType, example: FieldType.TEXT })
    @IsEnum(FieldType)
    @IsNotEmpty()
    fieldType: FieldType;

    @ApiProperty({ description: 'Display order', example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    fieldOrder: number;

    @ApiProperty({ description: 'Placeholder text', required: false, example: 'e.g., Breakout strategy' })
    @IsString()
    @IsOptional()
    placeholder?: string;

    @ApiProperty({ description: 'Default value', required: false })
    @IsString()
    @IsOptional()
    defaultValue?: string;

    @ApiProperty({
        description: 'Choice options for MULTIPLE_CHOICE fields',
        required: false,
        type: [String],
        example: ['A+ setup', 'B setup', 'C setup'],
    })
    @ValidateIf((o) => o.fieldType === FieldType.MULTIPLE_CHOICE)
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @IsOptional()
    fieldOptions?: string[];

    @ApiProperty({
        description: 'Scorecard configuration for SCORECARD fields',
        required: false,
        type: ScorecardConfigDto,
    })
    @ValidateIf((o) => o.fieldType === FieldType.SCORECARD)
    @ValidateNested()
    @Type(() => ScorecardConfigDto)
    @IsOptional()
    scorecard?: ScorecardConfigDto;
}

export class CreateLogTemplateDto {
    @ApiProperty({ description: 'Template name', example: 'My Trading Checklist' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Template description', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Template fields', type: [CreateTemplateFieldDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTemplateFieldDto)
    fields: CreateTemplateFieldDto[];
}
