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
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
let S3Service = S3Service_1 = class S3Service {
    configService;
    logger = new common_1.Logger(S3Service_1.name);
    s3Client = null;
    bucket;
    region;
    isConfigured = false;
    s3Sdk = null;
    constructor(configService) {
        this.configService = configService;
        this.bucket = this.configService.get('AWS_S3_BUCKET', '');
        this.region = this.configService.get('AWS_REGION', 'us-east-1');
        this.initializeS3();
    }
    initializeS3() {
        try {
            const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
            const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
            if (!accessKeyId || !secretAccessKey || !this.bucket) {
                this.logger.warn('AWS S3 not configured — image uploads disabled');
                return;
            }
            this.s3Sdk = require('@aws-sdk/client-s3');
            const { S3Client } = this.s3Sdk;
            this.s3Client = new S3Client({
                region: this.region,
                credentials: { accessKeyId, secretAccessKey },
            });
            this.isConfigured = true;
            this.logger.log('AWS S3 configured successfully');
        }
        catch {
            this.logger.warn('AWS S3 SDK not available — image uploads disabled');
        }
    }
    get available() {
        return this.isConfigured && this.s3Client !== null;
    }
    async uploadImage(fileBuffer, originalName, mimeType) {
        if (!this.available) {
            this.logger.warn('S3 not available, skipping image upload');
            return null;
        }
        try {
            const ext = originalName.split('.').pop() || 'jpg';
            const key = `trade-images/${(0, crypto_1.randomUUID)()}.${ext}`;
            const { PutObjectCommand } = this.s3Sdk;
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: fileBuffer,
                ContentType: mimeType,
            }));
            return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
        }
        catch (error) {
            this.logger.error('Failed to upload image to S3', error);
            return null;
        }
    }
    async deleteImage(imageUrl) {
        if (!this.available)
            return;
        try {
            const url = new URL(imageUrl);
            const key = url.pathname.substring(1);
            const { DeleteObjectCommand } = this.s3Sdk;
            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
        }
        catch (error) {
            this.logger.error('Failed to delete image from S3', error);
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map