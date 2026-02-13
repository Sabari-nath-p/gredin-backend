import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthService {
    private prisma;
    private usersService;
    private jwtService;
    private emailService;
    private readonly DEFAULT_OTP;
    private readonly OTP_EXPIRY_MINUTES;
    constructor(prisma: PrismaService, usersService: UsersService, jwtService: JwtService, emailService: EmailService);
    sendOtp(sendOtpDto: SendOtpDto): Promise<{
        message: string;
        userId?: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        accessToken: string;
        user: any;
    }>;
    googleLogin(googleUser: any): Promise<{
        accessToken: string;
        user: any;
    }>;
    validateUser(userId: string): Promise<any>;
}
