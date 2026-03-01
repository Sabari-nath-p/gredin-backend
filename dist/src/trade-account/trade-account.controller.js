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
exports.TradeAccountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trade_account_service_1 = require("./trade-account.service");
const create_trade_account_dto_1 = require("./dto/create-trade-account.dto");
const update_trade_account_dto_1 = require("./dto/update-trade-account.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TradeAccountController = class TradeAccountController {
    tradeAccountService;
    constructor(tradeAccountService) {
        this.tradeAccountService = tradeAccountService;
    }
    async create(req, createDto) {
        return this.tradeAccountService.create(req.user.userId, createDto);
    }
    async findAllByUser(req, page, limit) {
        return this.tradeAccountService.findAllByUser(req.user.userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 100);
    }
    async findOne(id, req) {
        return this.tradeAccountService.findOne(id, req.user.userId, req.user.role);
    }
    async update(id, req, updateDto) {
        return this.tradeAccountService.update(id, req.user.userId, req.user.role, updateDto);
    }
    async delete(id, req) {
        await this.tradeAccountService.delete(id, req.user.userId, req.user.role);
    }
    async findAll(req) {
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new Error('Forbidden - Admin access required');
        }
        return this.tradeAccountService.findAll();
    }
    async getStats(req) {
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new Error('Forbidden - Admin access required');
        }
        return this.tradeAccountService.getAccountStats();
    }
};
exports.TradeAccountController = TradeAccountController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new trade account',
        description: 'Create a new trading account for the authenticated user. Users can create multiple accounts.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Trade account created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_trade_account_dto_1.CreateTradeAccountDto]),
    __metadata("design:returntype", Promise)
], TradeAccountController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all trade accounts for current user (paginated)',
        description: 'Retrieve all trading accounts belonging to the authenticated user.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of trade accounts retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TradeAccountController.prototype, "findAllByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a specific trade account',
        description: 'Retrieve details of a specific trade account. Users can only access their own accounts unless they are SUPER_ADMIN.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Trade account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trade account retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not your account' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade account not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TradeAccountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a trade account',
        description: 'Update account name, broker name, or active status. Users can only update their own accounts unless they are SUPER_ADMIN.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Trade account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trade account updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not your account' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade account not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_trade_account_dto_1.UpdateTradeAccountDto]),
    __metadata("design:returntype", Promise)
], TradeAccountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a trade account',
        description: 'Delete a trade account. Users can only delete their own accounts unless they are SUPER_ADMIN.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Trade account ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Trade account deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not your account' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade account not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TradeAccountController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all trade accounts (Admin only)',
        description: 'Retrieve all trade accounts across all users. Only accessible by SUPER_ADMIN.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All trade accounts retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradeAccountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get trade account statistics (Admin only)',
        description: 'Retrieve statistics about all trade accounts including counts by type and market segment. Only accessible by SUPER_ADMIN.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradeAccountController.prototype, "getStats", null);
exports.TradeAccountController = TradeAccountController = __decorate([
    (0, swagger_1.ApiTags)('Trade Accounts'),
    (0, common_1.Controller)('trade-accounts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [trade_account_service_1.TradeAccountService])
], TradeAccountController);
//# sourceMappingURL=trade-account.controller.js.map