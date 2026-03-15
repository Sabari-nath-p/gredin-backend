import { Test, TestingModule } from '@nestjs/testing';
import { Mt5SyncService } from './mt5-sync.service';

describe('Mt5SyncService', () => {
  let service: Mt5SyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Mt5SyncService],
    }).compile();

    service = module.get<Mt5SyncService>(Mt5SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
