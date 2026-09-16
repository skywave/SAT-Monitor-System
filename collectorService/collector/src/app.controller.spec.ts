import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './app.controller';
import { PBXManager } from './pbx/pbx.manager';

describe('ApiController', () => {
  let controller: ApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        {
          provide: PBXManager,
          useValue: {
            getInstance: jest.fn(),
            getAllInstances: jest.fn().mockReturnValue([]),
          },
        },
      ],
    }).compile();

    controller = app.get<ApiController>(ApiController);
  });

  describe('health', () => {
    it('should return ok status with a timestamp', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(typeof result.timestamp).toBe('string');
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });
  });
});
