import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import { AuthProvider, UserRole } from '@prisma/client';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  private readonly DEFAULT_OTP = '759409';
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async sendOtp(sendOtpDto: SendOtpDto): Promise<{ message: string; userId?: string }> {
    const { email } = sendOtpDto;

    // Check if user exists, if not create new user
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.createUser(email, AuthProvider.EMAIL);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Always use default OTP
    const otp = this.DEFAULT_OTP;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Delete any existing unused OTP sessions for this user
    await this.prisma.otpSession.deleteMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
    });

    // Create new OTP session
    await this.prisma.otpSession.create({
      data: {
        userId: user.id,
        otp,
        expiresAt,
      },
    });

    // Send OTP via email
    await this.emailService.sendOtpEmail(email, otp);

    return {
      message: 'OTP sent successfully to your email',
      userId: user.id,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ accessToken: string; user: any }> {
    const { email, otp } = verifyOtpDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Find valid OTP session
    const otpSession = await this.prisma.otpSession.findFirst({
      where: {
        userId: user.id,
        otp,
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otpSession) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.otpSession.update({
      where: { id: otpSession.id },
      data: { isUsed: true },
    });

    // Generate JWT token
    const payload = {
      email: user.email,
      userId: user.id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        authProvider: user.authProvider,
      },
    };
  }

  async googleLogin(googleUser: any): Promise<{ accessToken: string; user: any }> {
    const { email, googleId, name } = googleUser;

    // Check if user exists with this Google ID
    let user = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      // Check if user exists with this email
      user = await this.usersService.findByEmail(email);

      if (user) {
        // Update existing user with Google ID
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            authProvider: AuthProvider.GOOGLE,
          },
        });
      } else {
        // Create new user
        user = await this.usersService.createUser(email, AuthProvider.GOOGLE, googleId);

        // Update name if provided by Google
        if (name) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { name },
          });
        }
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Generate JWT token
    const payload = {
      email: user.email,
      userId: user.id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        authProvider: user.authProvider,
      },
    };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
