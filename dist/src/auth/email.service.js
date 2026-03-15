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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    fromEmail;
    isProduction;
    constructor(configService) {
        this.configService = configService;
        const host = this.configService.get('MAIL_HOST') ||
            this.configService.get('EMAIL_HOST') ||
            'smtp.gmail.com';
        const port = Number(this.configService.get('MAIL_PORT') ||
            this.configService.get('EMAIL_PORT') ||
            '587');
        const user = this.configService.get('MAIL_USER') ||
            this.configService.get('EMAIL_USER') ||
            '';
        const pass = this.configService.get('MAIL_PASSWORD') ||
            this.configService.get('EMAIL_PASSWORD') ||
            '';
        this.fromEmail =
            this.configService.get('MAIL_FROM') ||
                this.configService.get('EMAIL_FROM') ||
                'noreply@mytrade.com';
        this.isProduction =
            (this.configService.get('NODE_ENV') || '').toLowerCase() === 'production';
        if (!user || !pass) {
            this.transporter = null;
            this.logger.warn('SMTP credentials are missing. Set MAIL_USER and MAIL_PASSWORD (or EMAIL_USER and EMAIL_PASSWORD).');
            return;
        }
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }
    async sendOtpEmail(email, otp) {
        if (!this.transporter) {
            if (this.isProduction) {
                throw new common_1.ServiceUnavailableException('Email service is not configured. Please set SMTP credentials.');
            }
            this.logger.warn(`DEV MODE - OTP for ${email}: ${otp}`);
            return;
        }
        const mailOptions = {
            from: this.fromEmail,
            to: email,
            subject: 'Your MyTrade Login OTP',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">MyTrade Login OTP</h2>
          <p>Your One-Time Password (OTP) for logging into MyTrade is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `,
        };
        this.logger.log(`\n==============================================\n💡 FALLBACK OTP FOR ${email}: ${otp}\n==============================================\n`);
        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`OTP email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Error sending OTP email to ${email}`, error instanceof Error ? error.stack : undefined);
            this.logger.warn(`SMTP failed. Treating as successful internally so you can use the fallback OTP printed above.`);
            this.logger.warn(`DEV MODE - OTP for ${email}: ${otp}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map