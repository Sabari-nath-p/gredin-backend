"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLogTemplateDto = exports.CreateTemplateFieldDto = exports.FieldType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var FieldType;
(function (FieldType) {
    FieldType["TEXT"] = "TEXT";
    FieldType["LONG_TEXT"] = "LONG_TEXT";
    FieldType["CHECKBOX"] = "CHECKBOX";
    FieldType["IMAGE"] = "IMAGE";
})(FieldType || (exports.FieldType = FieldType = {}));
class CreateTemplateFieldDto {
    fieldName;
    fieldType;
    fieldOrder;
    placeholder;
    defaultValue;
}
exports.CreateTemplateFieldDto = CreateTemplateFieldDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field name/label', example: 'Strategy Used' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTemplateFieldDto.prototype, "fieldName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field type', enum: FieldType, example: FieldType.TEXT }),
    (0, class_validator_1.IsEnum)(FieldType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTemplateFieldDto.prototype, "fieldType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display order', example: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTemplateFieldDto.prototype, "fieldOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Placeholder text', required: false, example: 'e.g., Breakout strategy' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTemplateFieldDto.prototype, "placeholder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default value', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTemplateFieldDto.prototype, "defaultValue", void 0);
class CreateLogTemplateDto {
    name;
    description;
    fields;
}
exports.CreateLogTemplateDto = CreateLogTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template name', example: 'My Trading Checklist' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLogTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template description', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLogTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template fields', type: [CreateTemplateFieldDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateTemplateFieldDto),
    __metadata("design:type", Array)
], CreateLogTemplateDto.prototype, "fields", void 0);
//# sourceMappingURL=create-log-template.dto.js.map