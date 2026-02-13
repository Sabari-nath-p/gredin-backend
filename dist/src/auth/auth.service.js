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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const email_service_1 = require("./email.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    prisma;
    usersService;
    jwtService;
    emailService;
    DEFAULT_OTP = '759409';
    OTP_EXPIRY_MINUTES = 10;
    constructor(prisma, usersService, jwtService, emailService) {
        this.prisma = prisma;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async sendOtp(sendOtpDto) {
        const { email } = sendOtpDto;
        let user = await this.usersService.findByEmail(email);
        if (!user) {
            user = await this.usersService.createUser(email, client_1.AuthProvider.EMAIL);
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is deactivated');
        }
        const otp = this.DEFAULT_OTP;
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);
        await this.prisma.otpSession.deleteMany({
            where: {
                userId: user.id,
                isUsed: false,
            },
        });
        await this.prisma.otpSession.create({
            data: {
                userId: user.id,
                otp,
                expiresAt,
            },
        });
        await this.emailService.sendOtpEmail(email, otp);
        return {
            message: 'OTP sent successfully to your email',
            userId: user.id,
        };
    }
    async verifyOtp(verifyOtpDto) {
        const { email, otp } = verifyOtpDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is deactivated');
        }
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
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        }
        await this.prisma.otpSession.update({
            where: { id: otpSession.id },
            data: { isUsed: true },
        });
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
    async googleLogin(googleUser) {
        const { email, googleId, name } = googleUser;
        let user = await this.usersService.findByGoogleId(googleId);
        if (!user) {
            user = await this.usersService.findByEmail(email);
            if (user) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId,
                        authProvider: client_1.AuthProvider.GOOGLE,
                    },
                });
            }
            else {
                user = await this.usersService.createUser(email, client_1.AuthProvider.GOOGLE, googleId);
                if (name) {
                    user = await this.prisma.user.update({
                        where: { id: user.id },
                        data: { name },
                    });
                }
            }
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is deactivated');
        }
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
    async validateUser(userId) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map