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
exports.S3Controller = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const s3_service_1 = require("./s3.service");
let S3Controller = class S3Controller {
    s3Service;
    constructor(s3Service) {
        this.s3Service = s3Service;
    }
    async uploadImage(file, req) {
        if (!file) {
            return { url: null, message: 'No file provided' };
        }
        try {
            const url = await this.s3Service.uploadImage(file.buffer, file.originalname, file.mimetype);
            return { url, message: url ? 'Image uploaded successfully' : 'S3 not configured, image skipped' };
        }
        catch {
            return { url: null, message: 'Image upload failed, continuing without image' };
        }
    }
};
exports.S3Controller = S3Controller;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 5 * 1024 * 1024 } })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Upload an image (S3)', description: 'Uploads image to S3. Returns null URL if S3 is not configured.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Image uploaded (or skipped if S3 not configured)' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], S3Controller.prototype, "uploadImage", null);
exports.S3Controller = S3Controller = __decorate([
    (0, swagger_1.ApiTags)('Upload'),
    (0, common_1.Controller)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [s3_service_1.S3Service])
], S3Controller);
//# sourceMappingURL=s3.controller.js.map