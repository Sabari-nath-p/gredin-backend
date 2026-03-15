import { Mt5SyncService } from './mt5-sync.service';
import { LinkMt5Dto } from './dto/link-mt5.dto';
export declare class Mt5SyncController {
    private readonly mt5SyncService;
    constructor(mt5SyncService: Mt5SyncService);
    linkAccount(req: any, accountId: string, dto: LinkMt5Dto): Promise<{
        message: string;
    }>;
    unlinkAccount(req: any, accountId: string): Promise<{
        message: string;
    }>;
    syncAccount(req: any, accountId: string): Promise<{
        added: number;
        message: string;
    }>;
}
