jest.mock('./cache.service', () => ({
  CacheService: class MockCacheService {},
}));

jest.mock('./cache.controller', () => ({
  CacheController: class MockCacheController {},
}));

jest.mock('../common/transports/nast.module', () => ({
  NastModule: class MockNastModule {},
}));

describe('CacheModule', () => {
  it('should be defined as a module', async () => {
    const { CacheModule } = await import('./cache.module');
    expect(CacheModule).toBeDefined();
    expect(typeof CacheModule).toBe('function');
  });

  it('should have correct module metadata', async () => {
    const { CacheModule } = await import('./cache.module');
    const { CacheController } = await import('./cache.controller');
    const { CacheService } = await import('./cache.service');
    const { NastModule } = await import('../common/transports/nast.module');

    const controllers = Reflect.getMetadata('controllers', CacheModule);
    const providers = Reflect.getMetadata('providers', CacheModule);
    const imports = Reflect.getMetadata('imports', CacheModule);

    expect(controllers).toContain(CacheController);
    expect(providers).toContain(CacheService);
    expect(imports).toContain(NastModule);
  });

  it('should export CacheController and CacheService classes', async () => {
    const { CacheController } = await import('./cache.controller');
    const { CacheService } = await import('./cache.service');

    expect(typeof CacheController).toBe('function');
    expect(typeof CacheService).toBe('function');
  });
});
