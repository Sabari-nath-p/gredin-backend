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
exports.LogTemplateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const log_template_service_1 = require("./log-template.service");
const create_log_template_dto_1 = require("./dto/create-log-template.dto");
const update_log_template_dto_1 = require("./dto/update-log-template.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let LogTemplateController = class LogTemplateController {
    logTemplateService;
    constructor(logTemplateService) {
        this.logTemplateService = logTemplateService;
    }
    async create(req, dto) {
        return this.logTemplateService.create(req.user.userId, dto);
    }
    async findAll(req, page, limit) {
        return this.logTemplateService.findAllByUser(req.user.userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
    }
    async findOne(id, req) {
        return this.logTemplateService.findOne(id, req.user.userId, req.user.role);
    }
    async update(id, req, dto) {
        return this.logTemplateService.update(id, req.user.userId, req.user.role, dto);
    }
    async delete(id, req) {
        await this.logTemplateService.delete(id, req.user.userId, req.user.role);
    }
    async assignToAccount(id, accountId, req) {
        return this.logTemplateService.assignToAccount(id, accountId, req.user.userId, req.user.role);
    }
    async unassignFromAccount(accountId, req) {
        await this.logTemplateService.unassignFromAccount(accountId, req.user.userId, req.user.role);
    }
    async getTemplateForAccount(accountId, req) {
        return this.logTemplateService.getTemplateForAccount(accountId, req.user.userId, req.user.role);
    }
};
exports.LogTemplateController = LogTemplateController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new log template', description: 'Create a reusable log template with custom fields (text, long text, checkbox, image).' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Template created successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_log_template_dto_1.CreateLogTemplateDto]),
    __metadata("design:returntype", Promise)
], LogTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all templates for current user (paginated)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Templates retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LogTemplateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific template with fields' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Template ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogTemplateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a template and its fields' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Template ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template updated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_log_template_dto_1.UpdateLogTemplateDto]),
    __metadata("design:returntype", Promise)
], LogTemplateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a template' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Template ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Template deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogTemplateController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)(':id/assign/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign template to a trade account' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Template ID' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Trade account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template assigned to account' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('accountId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LogTemplateController.prototype, "assignToAccount", null);
__decorate([
    (0, common_1.Delete)('account/:accountId/template'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove template from a trade account' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Trade account ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Template unassigned from account' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogTemplateController.prototype, "unassignFromAccount", null);
__decorate([
    (0, common_1.Get)('account/:accountId/template'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the template assigned to a trade account' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Trade account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template for account (or null)' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogTemplateController.prototype, "getTemplateForAccount", null);
exports.LogTemplateController = LogTemplateController = __decorate([
    (0, swagger_1.ApiTags)('Log Templates'),
    (0, common_1.Controller)('log-templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [log_template_service_1.LogTemplateService])
], LogTemplateController);
//# sourceMappingURL=log-template.controller.js.map