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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
