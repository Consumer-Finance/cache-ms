describe('Config Index', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
    process.env.NATS_SERVERS = 'nats://localhost:4222';
    process.env.REDIS_URL = 'redis://localhost:6379';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should export envs and services', async () => {
    const indexExports = await import('./index');
    const services = await import('./services');

    expect(indexExports.envs).toBeDefined();
    expect(indexExports.NAST_SERVICE).toBeDefined();
    expect(indexExports.NAST_SERVICE).toBe(services.NAST_SERVICE);
  });

  it('should re-export all expected modules', async () => {
    const indexExports = await import('./index');
    const exports = Object.keys(indexExports);

    expect(exports).toContain('envs');
    expect(exports).toContain('NAST_SERVICE');
  });
});
