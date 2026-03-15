export declare enum FieldType {
    TEXT = "TEXT",
    LONG_TEXT = "LONG_TEXT",
    CHECKBOX = "CHECKBOX",
    IMAGE = "IMAGE",
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
}
export declare class CreateTemplateFieldDto {
    fieldName: string;
    fieldType: FieldType;
    fieldOrder: number;
    placeholder?: string;
    defaultValue?: string;
    fieldOptions?: string[];
}
export declare class CreateLogTemplateDto {
    name: string;
    description?: string;
    fields: CreateTemplateFieldDto[];
}
