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
exports.CloseTradeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_trade_entry_dto_1 = require("./create-trade-entry.dto");
class CloseTradeDto {
    result;
    realisedProfitLoss;
    serviceCharge;
    notes;
}
exports.CloseTradeDto = CloseTradeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Result of the trade',
        enum: create_trade_entry_dto_1.TradeResult,
        example: create_trade_entry_dto_1.TradeResult.PROFIT,
    }),
    (0, class_validator_1.IsEnum)(create_trade_entry_dto_1.TradeResult),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CloseTradeDto.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Realised profit or loss amount',
        example: 150.0,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CloseTradeDto.prototype, "realisedProfitLoss", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service charge/commission',
        example: 10.0,
        default: 0,
        required: false,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CloseTradeDto.prototype, "serviceCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional notes about closing the trade',
        example: 'Target achieved',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CloseTradeDto.prototype, "notes", void 0);
//# sourceMappingURL=close-trade.dto.js.map