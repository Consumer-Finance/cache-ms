import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      clear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get<Cache>(CACHE_MANAGER) as jest.Mocked<Cache>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should call cacheManager.get with correct key', async () => {
      const key = 'test-key';
      const expectedValue = 'test-value';
      cacheManager.get.mockResolvedValue(expectedValue);

      const result = await service.get(key);

      expect(cacheManager.get).toHaveBeenCalledWith(key);
      expect(result).toBe(expectedValue);
    });

    it('should return undefined for non-existent key', async () => {
      const key = 'non-existent-key';
      cacheManager.get.mockResolvedValue(undefined);

      const result = await service.get(key);

      expect(cacheManager.get).toHaveBeenCalledWith(key);
      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should call cacheManager.set with key and value', async () => {
      const key = 'test-key';
      const value = 'test-value';
      cacheManager.set.mockResolvedValue(undefined);

      await service.set(key, value);

      expect(cacheManager.set).toHaveBeenCalledWith(key, value, undefined);
    });

    it('should call cacheManager.set with key, value, and TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 3600;
      cacheManager.set.mockResolvedValue(undefined);

      await service.set(key, value, ttl);

      expect(cacheManager.set).toHaveBeenCalledWith(key, value, ttl);
    });

    it('should handle complex objects as values', async () => {
      const key = 'test-key';
      const value = { data: 'test', nested: { prop: 123 } };
      cacheManager.set.mockResolvedValue(undefined);

      await service.set(key, value);

      expect(cacheManager.set).toHaveBeenCalledWith(key, value, undefined);
    });

    it('should delete key when setting undefined value', async () => {
      const key = 'test-key';
      cacheManager.del.mockResolvedValue(true);

      await service.set(key, undefined);

      expect(cacheManager.del).toHaveBeenCalledWith(key);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should delete key when setting null value', async () => {
      const key = 'test-key';
      cacheManager.del.mockResolvedValue(true);

      await service.set(key, null);

      expect(cacheManager.del).toHaveBeenCalledWith(key);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('del', () => {
    it('should call cacheManager.del with correct key', async () => {
      const key = 'test-key';
      cacheManager.del.mockResolvedValue(true);

      await service.del(key);

      expect(cacheManager.del).toHaveBeenCalledWith(key);
    });
  });

  describe('clear', () => {
    it('should call cacheManager.clear', async () => {
      cacheManager.clear.mockResolvedValue(true);

      await service.clear();

      expect(cacheManager.clear).toHaveBeenCalled();
    });
  });
});