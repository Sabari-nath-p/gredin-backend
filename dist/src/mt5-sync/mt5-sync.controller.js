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
exports.Mt5SyncController = void 0;
const common_1 = require("@nestjs/common");
const mt5_sync_service_1 = require("./mt5-sync.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const link_mt5_dto_1 = require("./dto/link-mt5.dto");
const swagger_1 = require("@nestjs/swagger");
let Mt5SyncController = class Mt5SyncController {
    mt5SyncService;
    constructor(mt5SyncService) {
        this.mt5SyncService = mt5SyncService;
    }
    async linkAccount(req, accountId, dto) {
        await this.mt5SyncService.linkAccount(req.user.userId, accountId, dto);
        return { message: 'MT5 account linked successfully' };
    }
    async unlinkAccount(req, accountId) {
        await this.mt5SyncService.unlinkAccount(req.user.userId, accountId);
        return { message: 'MT5 account unlinked successfully' };
    }
    async syncAccount(req, accountId) {
        return this.mt5SyncService.syncAccount(req.user.userId, accountId);
    }
};
exports.Mt5SyncController = Mt5SyncController;
__decorate([
    (0, common_1.Post)('link/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Link an existing account to MT5' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Trade account ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'MT5 account linked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trade account not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('accountId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, link_mt5_dto_1.LinkMt5Dto]),
    __metadata("design:returntype", Promise)
], Mt5SyncController.prototype, "linkAccount", null);
__decorate([
    (0, common_1.Delete)('link/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink an MT5 account' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Trade account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'MT5 account unlinked successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], Mt5SyncController.prototype, "unlinkAccount", null);
__decorate([
    (0, common_1.Post)('sync/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Force sync an MT5 account' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Trade account ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'MT5 account synced successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], Mt5SyncController.prototype, "syncAccount", null);
exports.Mt5SyncController = Mt5SyncController = __decorate([
    (0, swagger_1.ApiTags)('MT5 Integration'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('mt5'),
    __metadata("design:paramtypes", [mt5_sync_service_1.Mt5SyncService])
], Mt5SyncController);
//# sourceMappingURL=mt5-sync.controller.js.map