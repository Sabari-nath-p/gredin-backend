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
                'noreply@gredin.app';
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
                throw new common_1.ServiceUnavailableException('Email service is not configured. Please contact support.');
            }
            this.logger.warn(`[DEV] OTP for ${email}: ${otp}`);
            return;
        }
        const year = new Date().getFullYear();
        const mailOptions = {
            from: `"Gredin" <${this.fromEmail}>`,
            to: email,
            subject: 'Your Gredin verification code',
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your identity – Gredin</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f0f; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f; padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="width:100%; max-width:520px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#18181b; border:1px solid #27272a; border-radius:10px; padding:12px 24px;">
                    <p style="margin:0; font-size:18px; font-weight:700; letter-spacing:-0.5px; color:#ffffff;">
                      gredin<span style="color:#a78bfa;">.</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#18181b; border:1px solid #27272a; border-radius:16px; overflow:hidden;">

              <!-- Accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(90deg, #7c3aed 0%, #a78bfa 50%, #7c3aed 100%); height:3px; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Card body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 40px 16px;">

                    <!-- Icon -->
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="background-color:#1e1e2e; border:1px solid #2d2b55; border-radius:12px; width:48px; height:48px; text-align:center; vertical-align:middle;">
                          <p style="margin:0; font-size:22px; line-height:48px;">&#128274;</p>
                        </td>
                      </tr>
                    </table>

                    <h1 style="margin:0 0 10px; font-size:22px; font-weight:700; color:#f4f4f5; letter-spacing:-0.4px; line-height:1.3;">
                      Verify your identity
                    </h1>
                    <p style="margin:0 0 32px; font-size:15px; color:#71717a; line-height:1.65;">
                      Enter the code below to sign in to your Gredin account.
                      For your security, this code expires in <span style="color:#a78bfa; font-weight:600;">10 minutes</span>.
                    </p>

                    <!-- OTP block -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                      <tr>
                        <td align="center" style="background-color:#0f0f0f; border:1px solid #27272a; border-radius:12px; padding:28px 20px;">
                          <p style="margin:0 0 8px; font-size:11px; font-weight:600; letter-spacing:2px; color:#52525b; text-transform:uppercase;">
                            One-Time Passcode
                          </p>
                          <p style="margin:0; font-size:40px; font-weight:700; letter-spacing:14px; color:#ffffff; font-family:'Courier New', Courier, monospace; text-indent:14px;">
                            ${otp}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="border-top:1px solid #27272a; font-size:0; line-height:0;">&nbsp;</td>
                      </tr>
                    </table>

                    <!-- Security note -->
                    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
                      <tr>
                        <td width="20" valign="top" style="padding-top:1px;">
                          <p style="margin:0; font-size:14px;">&#9888;&#65039;</p>
                        </td>
                        <td style="padding-left:10px;">
                          <p style="margin:0; font-size:13px; color:#52525b; line-height:1.6;">
                            Gredin will <strong style="color:#71717a;">never</strong> ask for this code via phone or chat.
                            If you didn't request this, you can safely ignore this email — your account remains secure.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Footer inside card -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#111113; border-top:1px solid #27272a; padding:20px 40px;">
                    <p style="margin:0; font-size:12px; color:#3f3f46; line-height:1.6;">
                      Sent to <span style="color:#52525b;">${email}</span> &nbsp;&middot;&nbsp;
                      &copy; ${year} Gredin &nbsp;&middot;&nbsp;
                      This is an automated message — please do not reply.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Bottom tagline -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0; font-size:12px; color:#3f3f46; letter-spacing:0.2px;">
                Trade smarter with <span style="color:#52525b;">Gredin</span>
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
        }
        catch (error) {
            this.logger.error(`Failed to send OTP email to ${email}`, error instanceof Error ? error.stack : String(error));
            if (this.isProduction) {
                throw new common_1.ServiceUnavailableException('Unable to deliver verification email. Please try again later.');
            }
            this.logger.warn(`\n${'─'.repeat(52)}\n` +
                `  [DEV FALLBACK] OTP for ${email}: ${otp}\n` +
                `${'─'.repeat(52)}\n`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map