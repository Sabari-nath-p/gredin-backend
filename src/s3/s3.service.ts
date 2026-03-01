import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private s3Client: any = null;
    private bucket: string;
    private region: string;
    private isConfigured = false;
    private s3Sdk: any = null;

    constructor(private configService: ConfigService) {
        this.bucket = this.configService.get<string>('AWS_S3_BUCKET', '');
        this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');

        this.initializeS3();
    }

    private initializeS3() {
        try {
            const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
            const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

            if (!accessKeyId || !secretAccessKey || !this.bucket) {
                this.logger.warn('AWS S3 not configured — image uploads disabled');
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            this.s3Sdk = require('@aws-sdk/client-s3');
            const { S3Client } = this.s3Sdk;
            this.s3Client = new S3Client({
                region: this.region,
                credentials: { accessKeyId, secretAccessKey },
            });
            this.isConfigured = true;
            this.logger.log('AWS S3 configured successfully');
        } catch {
            this.logger.warn('AWS S3 SDK not available — image uploads disabled');
        }
    }

    get available(): boolean {
        return this.isConfigured && this.s3Client !== null;
    }

    async uploadImage(
        fileBuffer: Buffer,
        originalName: string,
        mimeType: string,
    ): Promise<string | null> {
        if (!this.available) {
            this.logger.warn('S3 not available, skipping image upload');
            return null;
        }

        try {
            const ext = originalName.split('.').pop() || 'jpg';
            const key = `trade-images/${randomUUID()}.${ext}`;

            const { PutObjectCommand } = this.s3Sdk;
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: fileBuffer,
                    ContentType: mimeType,
                }),
            );

            return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
        } catch (error) {
            this.logger.error('Failed to upload image to S3', error);
            return null;
        }
    }

    async deleteImage(imageUrl: string): Promise<void> {
        if (!this.available) return;

        try {
            const url = new URL(imageUrl);
            const key = url.pathname.substring(1);

            const { DeleteObjectCommand } = this.s3Sdk;
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );
        } catch (error) {
            this.logger.error('Failed to delete image from S3', error);
        }
    }
}
