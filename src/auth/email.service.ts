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
        'Email service is not configured. Please contact support.',
      );
    }
    this.logger.warn(`[DEV] OTP for ${email}: ${otp}`);
    return;
  }

  const mailOptions = {
    from: `"Gredin" <${this.fromEmail}>`,
    to: email,
    subject: 'Your gredin.app verification code',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Gredin OTP</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f5f5f5; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">

                <!-- Header -->
                <tr>
                  <td style="background-color:#0f172a; padding:28px 40px;">
                    <p style="margin:0; font-size:20px; font-weight:700; color:#ffffff; letter-spacing:-0.3px;">
                      gredin<span style="color:#6366f1;">.app</span>
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <h1 style="margin:0 0 12px; font-size:22px; font-weight:600; color:#0f172a; letter-spacing:-0.3px;">
                      Verify your identity
                    </h1>
                    <p style="margin:0 0 28px; font-size:15px; color:#64748b; line-height:1.6;">
                      Use the code below to complete your sign-in. It expires in <strong style="color:#0f172a;">10 minutes</strong>.
                    </p>

                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:24px;">
                          <p style="margin:0; font-size:36px; font-weight:700; letter-spacing:10px; color:#0f172a; font-family:'Courier New', monospace;">
                            ${otp}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:28px 0 0; font-size:13px; color:#94a3b8; line-height:1.6;">
                      If you didn't request this code, you can safely ignore this email. Someone may have entered your address by mistake.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 40px;">
                    <p style="margin:0; font-size:12px; color:#94a3b8;">
                      &copy; ${new Date().getFullYear()} gredin.app &nbsp;&middot;&nbsp; This is an automated message, please do not reply.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await this.transporter.sendMail(mailOptions);
    this.logger.log(`OTP email dispatched to ${email}`);
  } catch (error: unknown) {
    this.logger.error(
      `Failed to send OTP email to ${email}`,
      error instanceof Error ? error.stack : String(error),
    );

    if (this.isProduction) {
      throw new ServiceUnavailableException(
        'Unable to deliver verification email. Please try again later.',
      );
    }

    // Dev fallback — log OTP so login flow can be tested without a working SMTP
    this.logger.warn(
      `\n${'─'.repeat(52)}\n` +
      `  [DEV FALLBACK] OTP for ${email}: ${otp}\n` +
      `${'─'.repeat(52)}\n`,
    );
  }
}
}
