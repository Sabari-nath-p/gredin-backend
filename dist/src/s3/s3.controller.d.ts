import { S3Service } from './s3.service';
export declare class S3Controller {
    private readonly s3Service;
    constructor(s3Service: S3Service);
    uploadImage(file: Express.Multer.File, req: any): Promise<{
        url: string | null;
        message: string;
    }>;
}
