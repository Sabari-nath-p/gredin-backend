import { FieldType } from './create-log-template.dto';
export declare class UpdateTemplateFieldDto {
    id?: string;
    fieldName?: string;
    fieldType?: FieldType;
    fieldOrder?: number;
    placeholder?: string;
    defaultValue?: string;
    fieldOptions?: string[];
}
export declare class UpdateLogTemplateDto {
    name?: string;
    description?: string;
    isActive?: boolean;
    fields?: UpdateTemplateFieldDto[];
}
