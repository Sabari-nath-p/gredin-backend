import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendOtp(sendOtpDto: SendOtpDto): Promise<{
        message: string;
        userId?: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        accessToken: string;
        user: any;
    }>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any): Promise<{
        accessToken: string;
        user: any;
    }>;
}
