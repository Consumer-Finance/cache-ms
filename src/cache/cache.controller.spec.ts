import { Test, TestingModule } from '@nestjs/testing';
import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';

describe('CacheController', () => {
  let controller: CacheController;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      clear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CacheController],
      providers: [
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    controller = module.get<CacheController>(CacheController);
    cacheService = module.get<CacheService>(
      CacheService,
    ) as jest.Mocked<CacheService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should call cacheService.get with correct key', async () => {
      const key = 'test-key';
      const expectedValue = 'test-value';
      cacheService.get.mockResolvedValue(expectedValue);

      const result = await controller.get(key);

      expect(cacheService.get).toHaveBeenCalledWith(key);
      expect(result).toBe(expectedValue);
    });

    it('should return undefined for non-existent key', async () => {
      const key = 'non-existent-key';
      cacheService.get.mockResolvedValue(undefined);

      const result = await controller.get(key);

      expect(cacheService.get).toHaveBeenCalledWith(key);
      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should call cacheService.set with key and value', async () => {
      const data = { key: 'test-key', value: 'test-value' };
      cacheService.set.mockResolvedValue(undefined);

      await controller.set(data);

      expect(cacheService.set).toHaveBeenCalledWith(
        data.key,
        data.value,
        undefined,
      );
    });

    it('should call cacheService.set with key, value, and TTL', async () => {
      const data = { key: 'test-key', value: 'test-value', ttl: 3600 };
      cacheService.set.mockResolvedValue(undefined);

      await controller.set(data);

      expect(cacheService.set).toHaveBeenCalledWith(
        data.key,
        data.value,
        data.ttl,
      );
    });

    it('should handle complex objects as values', async () => {
      const data = {
        key: 'test-key',
        value: { data: 'test', nested: { prop: 123 } },
        ttl: 1800,
      };
      cacheService.set.mockResolvedValue(undefined);

      await controller.set(data);

      expect(cacheService.set).toHaveBeenCalledWith(
        data.key,
        data.value,
        data.ttl,
      );
    });
  });

  describe('delete', () => {
    it('should call cacheService.del with correct key', async () => {
      const key = 'test-key';
      cacheService.del.mockResolvedValue(true);

      await controller.delete(key);

      expect(cacheService.del).toHaveBeenCalledWith(key);
    });
  });

  describe('clear', () => {
    it('should call cacheService.clear', async () => {
      cacheService.clear.mockResolvedValue(true);

      await controller.clear();

      expect(cacheService.clear).toHaveBeenCalled();
    });
  });
});
