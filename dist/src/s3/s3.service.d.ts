import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private configService;
    private readonly logger;
    private s3Client;
    private bucket;
    private region;
    private isConfigured;
    private s3Sdk;
    constructor(configService: ConfigService);
    private initializeS3;
    get available(): boolean;
    uploadImage(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string | null>;
    deleteImage(imageUrl: string): Promise<void>;
}
