export declare enum FieldType {
    TEXT = "TEXT",
    LONG_TEXT = "LONG_TEXT",
    CHECKBOX = "CHECKBOX",
    IMAGE = "IMAGE",
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    SCORECARD = "SCORECARD"
}
export declare class ScorecardOptionDto {
    label: string;
    score: number;
}
export declare class ScorecardConfigDto {
    weight?: number;
    options: ScorecardOptionDto[];
}
export declare class CreateTemplateFieldDto {
    fieldName: string;
    fieldType: FieldType;
    fieldOrder: number;
    placeholder?: string;
    defaultValue?: string;
    fieldOptions?: string[];
    scorecard?: ScorecardConfigDto;
}
export declare class CreateLogTemplateDto {
    name: string;
    description?: string;
    fields: CreateTemplateFieldDto[];
}
