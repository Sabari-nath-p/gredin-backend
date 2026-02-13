import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        authProvider: import(".prisma/client").$Enums.AuthProvider;
        googleId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(req: any, updateDto: UpdateProfileDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        authProvider: import(".prisma/client").$Enums.AuthProvider;
        googleId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllUsers(): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        authProvider: import(".prisma/client").$Enums.AuthProvider;
        googleId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
