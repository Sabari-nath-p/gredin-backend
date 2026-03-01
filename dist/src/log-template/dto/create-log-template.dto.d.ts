export declare enum FieldType {
    TEXT = "TEXT",
    LONG_TEXT = "LONG_TEXT",
    CHECKBOX = "CHECKBOX",
    IMAGE = "IMAGE"
}
export declare class CreateTemplateFieldDto {
    fieldName: string;
    fieldType: FieldType;
    fieldOrder: number;
    placeholder?: string;
    defaultValue?: string;
}
export declare class CreateLogTemplateDto {
    name: string;
    description?: string;
    fields: CreateTemplateFieldDto[];
}
