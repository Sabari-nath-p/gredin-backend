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
exports.CreateTradeEntryDto = exports.TradeResult = exports.TradeStatus = exports.TradeDirection = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TradeDirection;
(function (TradeDirection) {
    TradeDirection["BUY"] = "BUY";
    TradeDirection["SELL"] = "SELL";
})(TradeDirection || (exports.TradeDirection = TradeDirection = {}));
var TradeStatus;
(function (TradeStatus) {
    TradeStatus["OPEN"] = "OPEN";
    TradeStatus["CLOSED"] = "CLOSED";
})(TradeStatus || (exports.TradeStatus = TradeStatus = {}));
var TradeResult;
(function (TradeResult) {
    TradeResult["PROFIT"] = "PROFIT";
    TradeResult["LOSS"] = "LOSS";
    TradeResult["BREAK_EVEN"] = "BREAK_EVEN";
})(TradeResult || (exports.TradeResult = TradeResult = {}));
class CreateTradeEntryDto {
    tradeAccountId;
    entryDateTime;
    instrument;
    direction;
    entryPrice;
    positionSize;
    stopLossAmount;
    takeProfitAmount;
    status;
    result;
    realisedProfitLoss;
    serviceCharge;
    notes;
}
exports.CreateTradeEntryDto = CreateTradeEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Trade account ID',
        example: 'uuid-of-trade-account',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTradeEntryDto.prototype, "tradeAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date and time of the trade entry',
        example: '2026-01-03T10:30:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTradeEntryDto.prototype, "entryDateTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the stock/instrument',
        example: 'AAPL',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTradeEntryDto.prototype, "instrument", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Trade direction',
        enum: TradeDirection,
        example: TradeDirection.BUY,
    }),
    (0, class_validator_1.IsEnum)(TradeDirection),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTradeEntryDto.prototype, "direction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entry price of the stock (optional)',
        example: 150.25,
        required: false,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTradeEntryDto.prototype, "entryPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity of stock purchased (optional)',
        example: 10,
        required: false,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateTradeEntryDto.prototype, "positionSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Stop loss amount (maximum acceptable loss)',
        example: 100.0,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTradeEntryDto.prototype, "stopLossAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Take profit amount (expected profit)',
        example: 200.0,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTradeEntryDto.prototype, "takeProfitAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status of the trade',
        enum: TradeStatus,
        example: TradeStatus.OPEN,
        default: TradeStatus.OPEN,
    }),
    (0, class_validator_1.IsEnum)(TradeStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTradeEntryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Result of the trade (required if status is CLOSED)',
        enum: TradeResult,
        example: TradeResult.PROFIT,
        required: false,
    }),
    (0, class_validator_1.ValidateIf)((o) => o.status === TradeStatus.CLOSED),
    (0, class_validator_1.IsEnum)(TradeResult),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTradeEntryDto.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Realised profit or loss amount (required if status is CLOSED)',
        example: 150.0,
        required: false,
    }),
    (0, class_validator_1.ValidateIf)((o) => o.status === TradeStatus.CLOSED),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateTradeEntryDto.prototype, "realisedProfitLoss", void 0);
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
], CreateTradeEntryDto.prototype, "serviceCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional notes about the trade',
        example: 'Strong breakout pattern observed',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTradeEntryDto.prototype, "notes", void 0);
//# sourceMappingURL=create-trade-entry.dto.js.map