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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeEntryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trade_entry_service_1 = require("./trade-entry.service");
const create_trade_entry_dto_1 = require("./dto/create-trade-entry.dto");
const update_trade_entry_dto_1 = require("./dto/update-trade-entry.dto");
const close_trade_dto_1 = require("./dto/close-trade.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TradeEntryController = class TradeEntryController {
    tradeEntryService;
    constructor(tradeEntryService) {
        this.tradeEntryService = tradeEntryService;
    }
    async create(req, createDto) {
        return this.tradeEntryService.create(req.user.userId, createDto);
    }
    async findAllByAccount(tradeAccountId, req, page, limit) {
        return this.tradeEntryService.findAllByAccount(tradeAccountId, req.user.userId, req.user.role, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
    }
    async getStats(tradeAccountId, req) {
        return this.tradeEntryService.getTradeStats(tradeAccountId, req.user.userId, req.user.role);
    }
    async findOne(id, req) {
        return this.tradeEntryService.findOne(id, req.user.userId, req.user.role);
    }
    async update(id, req, updateDto) {
        return this.tradeEntryService.update(id, req.user.userId, req.user.role, updateDto);
    }
    async closeTrade(id, req, closeDto) {
        return this.tradeEntryService.closeTrade(id, req.user.userId, req.user.role, closeDto);
    }
    async delete(id, req) {
        await this.tradeEntryService.delete(id, req.user.userId, req.user.role);
    }
    async findAll(req) {
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new Error('Forbidden - Admin access required');
        }
        return this.tradeEntryService.findAll();
    }
};
exports.TradeEntryController = TradeEntryController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new trade entry',
        description: `Create a trade entry for a specific account. 
    - Can be created with OPEN status (default) or directly as CLOSED
    - If CLOSED, must include: result, realisedProfitLoss
    - Account balance is automatically updated for CLOSED trades:
      * PROFIT: adds (realisedProfitLoss - serviceCharge)
            * LOSS: subtracts (realisedProfitLoss + serviceCharge)
      * BREAK_EVEN: subtracts serviceCharge only`,
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trade entry created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input or missing required fields for closed trade' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade account not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_trade_entry_dto_1.CreateTradeEntryDto]),
    __metadata("design:returntype", Promise)
], TradeEntryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('account/:tradeAccountId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all trade entries for a specific account (paginated)',
        description: 'Retrieve all trade entries for a specific trade account with pagination. Users can only view their own trades unless SUPER_ADMIN.',
    }),
    (0, swagger_1.ApiParam)({ name: 'tradeAccountId', description: 'Trade account ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trade entries retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not your account' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade account not found' }),
    __param(0, (0, common_1.Param)('tradeAccountId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], TradeEntryController.prototype, "findAllByAccount", null);
__decorate([
    (0, common_1.Get)('account/:tradeAccountId/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get trade statistics for an account',
        description: 'Get comprehensive statistics including total trades, win rate, profit/loss breakdown.',
    }),
    (0, swagger_1.ApiParam)({ name: 'tradeAccountId', description: 'Trade account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not your account' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade account not found' }),
    __param(0, (0, common_1.Param)('tradeAccountId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TradeEntryController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a specific trade entry',
        description: 'Retrieve detailed information about a specific trade entry.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Trade entry ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trade entry retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not your trade' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade entry not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TradeEntryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update an open trade entry',
        description: 'Update details of an OPEN trade. Cannot update CLOSED trades. Can update instrument, prices, stop loss, take profit, and notes.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Trade entry ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trade entry updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot update closed trade' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not your trade' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade entry not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_trade_entry_dto_1.UpdateTradeEntryDto]),
    __metadata("design:returntype", Promise)
], TradeEntryController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/close'),
    (0, swagger_1.ApiOperation)({
        summary: 'Close an open trade',
        description: `Close an OPEN trade and update account balance automatically.
    Balance changes:
    - PROFIT: adds (realisedProfitLoss - serviceCharge) to account
    - LOSS: subtracts (realisedProfitLoss + serviceCharge) from account
    - BREAK_EVEN: subtracts serviceCharge only from account`,
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Trade entry ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trade closed successfully and balance updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Trade is already closed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not your trade' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade entry not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, close_trade_dto_1.CloseTradeDto]),
    __metadata("design:returntype", Promise)
], TradeEntryController.prototype, "closeTrade", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a trade entry',
        description: 'Delete a trade entry. If the trade was CLOSED, the balance change will be reversed automatically.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Trade entry ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Trade entry deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not your trade' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade entry not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TradeEntryController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all trade entries (Admin only)',
        description: 'Retrieve all trade entries across all users and accounts. Only accessible by SUPER_ADMIN.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All trade entries retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradeEntryController.prototype, "findAll", null);
exports.TradeEntryController = TradeEntryController = __decorate([
    (0, swagger_1.ApiTags)('Trade Entries'),
    (0, common_1.Controller)('trade-entries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [trade_entry_service_1.TradeEntryService])
], TradeEntryController);
//# sourceMappingURL=trade-entry.controller.js.map