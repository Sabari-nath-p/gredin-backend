import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private readonly transporter;
    private readonly fromEmail;
    private readonly isProduction;
    constructor(configService: ConfigService);
    sendOtpEmail(email: string, otp: string): Promise<void>;
}
