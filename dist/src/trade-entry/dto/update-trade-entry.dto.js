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
exports.UpdateTradeEntryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateTradeEntryDto {
    entryDateTime;
    instrument;
    entryPrice;
    positionSize;
    stopLossAmount;
    takeProfitAmount;
    notes;
}
exports.UpdateTradeEntryDto = UpdateTradeEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date and time of the trade entry',
        example: '2026-01-03T10:30:00Z',
        required: false,
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTradeEntryDto.prototype, "entryDateTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the stock/instrument',
        example: 'AAPL',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTradeEntryDto.prototype, "instrument", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entry price of the stock',
        example: 150.25,
        required: false,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTradeEntryDto.prototype, "entryPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity of stock purchased',
        example: 10,
        required: false,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateTradeEntryDto.prototype, "positionSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Stop loss amount',
        example: 100.0,
        required: false,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTradeEntryDto.prototype, "stopLossAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Take profit amount',
        example: 200.0,
        required: false,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTradeEntryDto.prototype, "takeProfitAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional notes',
        example: 'Updated trade notes',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTradeEntryDto.prototype, "notes", void 0);
//# sourceMappingURL=update-trade-entry.dto.js.map