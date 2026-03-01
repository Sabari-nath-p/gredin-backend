import {
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { S3Service } from './s3.service';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) {}

    @Post('image')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    })
    @ApiOperation({ summary: 'Upload an image (S3)', description: 'Uploads image to S3. Returns null URL if S3 is not configured.' })
    @ApiResponse({ status: 200, description: 'Image uploaded (or skipped if S3 not configured)' })
    async uploadImage(@UploadedFile() file: Express.Multer.File, @Request() req) {
        if (!file) {
            return { url: null, message: 'No file provided' };
        }

        try {
            const url = await this.s3Service.uploadImage(
                file.buffer,
                file.originalname,
                file.mimetype,
            );
            return { url, message: url ? 'Image uploaded successfully' : 'S3 not configured, image skipped' };
        } catch {
            return { url: null, message: 'Image upload failed, continuing without image' };
        }
    }
}
