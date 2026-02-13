import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configure email transporter (you can customize this based on your email provider)
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM', 'noreply@mytrade.com'),
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
      console.log(`OTP sent to ${email}: ${otp}`);
    } catch (error) {
      console.error('Error sending email:', error);
      // In development, we'll just log the OTP
      console.log(`DEV MODE - OTP for ${email}: ${otp}`);
    }
  }
}
