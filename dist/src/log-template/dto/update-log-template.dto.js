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
exports.UpdateLogTemplateDto = exports.UpdateTemplateFieldDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_log_template_dto_1 = require("./create-log-template.dto");
class UpdateTemplateFieldDto {
    id;
    fieldName;
    fieldType;
    fieldOrder;
    placeholder;
    defaultValue;
}
exports.UpdateTemplateFieldDto = UpdateTemplateFieldDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field ID (omit for new fields)', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTemplateFieldDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field name/label', example: 'Strategy Used' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTemplateFieldDto.prototype, "fieldName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field type', enum: create_log_template_dto_1.FieldType, required: false }),
    (0, class_validator_1.IsEnum)(create_log_template_dto_1.FieldType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTemplateFieldDto.prototype, "fieldType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display order', required: false }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTemplateFieldDto.prototype, "fieldOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Placeholder text', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTemplateFieldDto.prototype, "placeholder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default value', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTemplateFieldDto.prototype, "defaultValue", void 0);
class UpdateLogTemplateDto {
    name;
    description;
    isActive;
    fields;
}
exports.UpdateLogTemplateDto = UpdateLogTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template name', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLogTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template description', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLogTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Active status', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLogTemplateDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated fields array (replaces all fields)', type: [UpdateTemplateFieldDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UpdateTemplateFieldDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateLogTemplateDto.prototype, "fields", void 0);
//# sourceMappingURL=update-log-template.dto.js.map