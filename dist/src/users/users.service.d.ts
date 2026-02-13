import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole, AuthProvider } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private prisma;
    private readonly adjectives;
    private readonly nouns;
    constructor(prisma: PrismaService);
    generateRandomName(): string;
    createUser(email: string, authProvider?: AuthProvider, googleId?: string, role?: UserRole): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User>;
    getProfile(userId: string): Promise<User>;
    getAllUsers(): Promise<User[]>;
    deactivateUser(userId: string): Promise<User>;
    activateUser(userId: string): Promise<User>;
}
