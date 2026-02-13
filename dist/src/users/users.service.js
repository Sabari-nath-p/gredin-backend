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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    prisma;
    adjectives = [
        'Swift', 'Brave', 'Wise', 'Noble', 'Bright', 'Bold', 'Calm', 'Keen',
        'Quick', 'Silent', 'Mighty', 'Gentle', 'Sharp', 'Grand', 'Fierce',
        'Lucky', 'Royal', 'Golden', 'Silver', 'Crystal'
    ];
    nouns = [
        'Tiger', 'Eagle', 'Lion', 'Wolf', 'Bear', 'Hawk', 'Fox', 'Dragon',
        'Phoenix', 'Falcon', 'Panther', 'Raven', 'Shark', 'Cobra', 'Lynx',
        'Warrior', 'Knight', 'Hunter', 'Ranger', 'Scout'
    ];
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateRandomName() {
        const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
        const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
        const number = Math.floor(Math.random() * 999);
        return `${adjective}${noun}${number}`;
    }
    async createUser(email, authProvider = client_1.AuthProvider.EMAIL, googleId, role = client_1.UserRole.USER) {
        const randomName = this.generateRandomName();
        return this.prisma.user.create({
            data: {
                email,
                name: randomName,
                authProvider,
                googleId,
                role,
            },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async findByGoogleId(googleId) {
        return this.prisma.user.findUnique({
            where: { googleId },
        });
    }
    async updateProfile(userId, updateDto) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                name: updateDto.name,
            },
        });
    }
    async getProfile(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getAllUsers() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async deactivateUser(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });
    }
    async activateUser(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: true },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map