import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole, AuthProvider } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  // Random name word sets for automatic name generation
  private readonly adjectives = [
    'Swift', 'Brave', 'Wise', 'Noble', 'Bright', 'Bold', 'Calm', 'Keen',
    'Quick', 'Silent', 'Mighty', 'Gentle', 'Sharp', 'Grand', 'Fierce',
    'Lucky', 'Royal', 'Golden', 'Silver', 'Crystal'
  ];

  private readonly nouns = [
    'Tiger', 'Eagle', 'Lion', 'Wolf', 'Bear', 'Hawk', 'Fox', 'Dragon',
    'Phoenix', 'Falcon', 'Panther', 'Raven', 'Shark', 'Cobra', 'Lynx',
    'Warrior', 'Knight', 'Hunter', 'Ranger', 'Scout'
  ];

  constructor(private prisma: PrismaService) { }

  generateRandomName(): string {
    const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
    const number = Math.floor(Math.random() * 999);
    return `${adjective}${noun}${number}`;
  }

  async createUser(
    email: string,
    authProvider: AuthProvider = AuthProvider.EMAIL,
    googleId?: string,
    role: UserRole = UserRole.USER,
  ): Promise<User> {
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

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateDto.name,
      },
    });
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivateUser(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async activateUser(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }
}
