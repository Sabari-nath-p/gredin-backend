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
exports.CreateTradeAccountDto = exports.AccountType = exports.MarketSegment = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var MarketSegment;
(function (MarketSegment) {
    MarketSegment["STOCK"] = "STOCK";
    MarketSegment["AUCTION"] = "AUCTION";
    MarketSegment["FUTURES"] = "FUTURES";
    MarketSegment["OPTIONS"] = "OPTIONS";
    MarketSegment["FOREX"] = "FOREX";
    MarketSegment["CRYPTO"] = "CRYPTO";
    MarketSegment["COMMODITIES"] = "COMMODITIES";
})(MarketSegment || (exports.MarketSegment = MarketSegment = {}));
var AccountType;
(function (AccountType) {
    AccountType["DEMO"] = "DEMO";
    AccountType["LIVE"] = "LIVE";
    AccountType["FUNDED"] = "FUNDED";
})(AccountType || (exports.AccountType = AccountType = {}));
class CreateTradeAccountDto {
    accountName;
    brokerName;
    marketSegment;
    currencyCode;
    initialBalance;
    accountType;
    mt5Login;
    mt5Password;
    mt5Server;
}
exports.CreateTradeAccountDto = CreateTradeAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the trading account',
        example: 'My Primary Trading Account',
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateTradeAccountDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the broker',
        example: 'Zerodha',
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateTradeAccountDto.prototype, "brokerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Market segment for trading',
        enum: MarketSegment,
        example: MarketSegment.STOCK,
    }),
    (0, class_validator_1.IsEnum)(MarketSegment),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTradeAccountDto.prototype, "marketSegment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code (ISO 4217)',
        example: 'USD',
        default: 'USD',
        maxLength: 3,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], CreateTradeAccountDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Initial account balance',
        example: 10000.00,
        minimum: 0,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateTradeAccountDto.prototype, "initialBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of trading account',
        enum: AccountType,
        example: AccountType.DEMO,
    }),
    (0, class_validator_1.IsEnum)(AccountType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTradeAccountDto.prototype, "accountType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTradeAccountDto.prototype, "mt5Login", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTradeAccountDto.prototype, "mt5Password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTradeAccountDto.prototype, "mt5Server", void 0);
//# sourceMappingURL=create-trade-account.dto.js.map