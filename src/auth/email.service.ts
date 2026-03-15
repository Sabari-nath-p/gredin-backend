import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly fromEmail: string;
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    const host =
      this.configService.get<string>('MAIL_HOST') ||
      this.configService.get<string>('EMAIL_HOST') ||
      'smtp.gmail.com';

    const port = Number(
      this.configService.get<string>('MAIL_PORT') ||
      this.configService.get<string>('EMAIL_PORT') ||
      '587',
    );

    const user =
      this.configService.get<string>('MAIL_USER') ||
      this.configService.get<string>('EMAIL_USER') ||
      '';

    const pass =
      this.configService.get<string>('MAIL_PASSWORD') ||
      this.configService.get<string>('EMAIL_PASSWORD') ||
      '';

    this.fromEmail =
      this.configService.get<string>('MAIL_FROM') ||
      this.configService.get<string>('EMAIL_FROM') ||
      'noreply@mytrade.com';

    this.isProduction =
      (this.configService.get<string>('NODE_ENV') || '').toLowerCase() === 'production';

    if (!user || !pass) {
      this.transporter = null;
      this.logger.warn(
        'SMTP credentials are missing. Set MAIL_USER and MAIL_PASSWORD (or EMAIL_USER and EMAIL_PASSWORD).',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: 
        {
           rejectUnauthorized: false,
         },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    if (!this.transporter) {
      if (this.isProduction) {
        throw new ServiceUnavailableException(
          'Email service is not configured. Please set SMTP credentials.',
        );
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

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent to ${email}`);
    } catch (error: unknown) {
      this.logger.error(`Error sending OTP email to ${email}`, error instanceof Error ? error.stack : undefined);

      if (this.isProduction) {
        throw new ServiceUnavailableException('Unable to send OTP email. Please try again later.');
      }

      this.logger.warn(`DEV MODE - OTP for ${email}: ${otp}`);
    }
  }
}
