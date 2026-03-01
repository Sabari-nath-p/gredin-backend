import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
    IsEnum,
    IsInt,
    IsBoolean,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from './create-log-template.dto';

export class UpdateTemplateFieldDto {
    @ApiProperty({ description: 'Field ID (omit for new fields)', required: false })
    @IsString()
    @IsOptional()
    id?: string;

    @ApiProperty({ description: 'Field name/label', example: 'Strategy Used' })
    @IsString()
    @IsOptional()
    fieldName?: string;

    @ApiProperty({ description: 'Field type', enum: FieldType, required: false })
    @IsEnum(FieldType)
    @IsOptional()
    fieldType?: FieldType;

    @ApiProperty({ description: 'Display order', required: false })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @Min(0)
    fieldOrder?: number;

    @ApiProperty({ description: 'Placeholder text', required: false })
    @IsString()
    @IsOptional()
    placeholder?: string;

    @ApiProperty({ description: 'Default value', required: false })
    @IsString()
    @IsOptional()
    defaultValue?: string;
}

export class UpdateLogTemplateDto {
    @ApiProperty({ description: 'Template name', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ description: 'Template description', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Active status', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ description: 'Updated fields array (replaces all fields)', type: [UpdateTemplateFieldDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateTemplateFieldDto)
    @IsOptional()
    fields?: UpdateTemplateFieldDto[];
}
