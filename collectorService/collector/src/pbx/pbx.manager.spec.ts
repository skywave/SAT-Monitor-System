import { Test, TestingModule } from '@nestjs/testing';
import { PBXManager } from './pbx.manager';
import { PBXInstance } from './instance/pbx.instance';
import { pbxConfigs } from '../config/pbx.config';

// Mock the PBXInstance class
jest.mock('./instance/pbx.instance', () => {
  return {
    PBXInstance: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      request: jest.fn().mockResolvedValue({}),
    })),
  };
});

describe('PBXManager', () => {
  let pbxManager: PBXManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PBXManager],
    }).compile();

    pbxManager = module.get<PBXManager>(PBXManager);
  });

  it('should be defined', () => {
    expect(pbxManager).toBeDefined();
  });

  it('should initialize all PBX instances on module init', async () => {
    // Manually trigger onModuleInit if needed, but it should be called by NestJS
    await pbxManager.onModuleInit();
    
    // Check if PBXInstance was called for each config
    expect(PBXInstance).toHaveBeenCalledTimes(pbxConfigs.length);
  });

  it('should return undefined for non-existent instance', () => {
    expect(pbxManager.getInstance('invalid-id')).toBeUndefined();
  });

  it('should throw error when getting extensions for non-existent PBX', async () => {
    await expect(pbxManager.getExtensions('invalid-id')).rejects.toThrow('PBX invalid-id not found');
  });
});
