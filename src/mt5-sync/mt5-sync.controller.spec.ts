import { Test, TestingModule } from '@nestjs/testing';
import { Mt5SyncController } from './mt5-sync.controller';

describe('Mt5SyncController', () => {
  let controller: Mt5SyncController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Mt5SyncController],
    }).compile();

    controller = module.get<Mt5SyncController>(Mt5SyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
