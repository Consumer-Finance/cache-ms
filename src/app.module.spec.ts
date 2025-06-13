import 'reflect-metadata';

jest.mock('./common/cache/redis.module', () => ({
  RedisModule: class MockRedisModule {},
}));

jest.mock('./common/transports/nast.module', () => ({
  NastModule: class MockNastModule {},
}));

jest.mock('./cache/cache.module', () => ({
  CacheModule: class MockCacheModule {},
}));

describe('AppModule', () => {
  it('should be defined as a module', async () => {
    const { AppModule } = await import('./app.module');
    expect(AppModule).toBeDefined();
    expect(typeof AppModule).toBe('function');
  });

  it('should have Module decorator', async () => {
    const { AppModule } = await import('./app.module');
    const moduleMetadata = Reflect.getMetadata('imports', AppModule);
    expect(moduleMetadata).toBeDefined();
    expect(Array.isArray(moduleMetadata)).toBe(true);
    expect(moduleMetadata).toHaveLength(3);
  });

  it('should import RedisModule, NastModule, and CacheModule', async () => {
    const { AppModule } = await import('./app.module');
    const { RedisModule } = await import('./common/cache/redis.module');
    const { NastModule } = await import('./common/transports/nast.module');
    const { CacheModule } = await import('./cache/cache.module');

    const moduleMetadata = Reflect.getMetadata('imports', AppModule);
    expect(moduleMetadata).toContain(RedisModule);
    expect(moduleMetadata).toContain(NastModule);
    expect(moduleMetadata).toContain(CacheModule);
  });
});
