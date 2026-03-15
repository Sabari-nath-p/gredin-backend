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
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FieldType {
    TEXT = 'TEXT',
    LONG_TEXT = 'LONG_TEXT',
    CHECKBOX = 'CHECKBOX',
    IMAGE = 'IMAGE',
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
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
