import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

jest.mock('@nestjs/core');
jest.mock('./app.module', () => ({
  AppModule: class MockAppModule {},
}));
jest.mock('./common/config', () => ({
  envs: {
    nats_servers: ['nats://localhost:4222'],
  },
}));

describe('Main Bootstrap', () => {
  let mockApp: any;
  let mockCreateMicroservice: jest.Mock;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockApp = {
      enableShutdownHooks: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    mockCreateMicroservice = jest.fn().mockResolvedValue(mockApp);
    (NestFactory.createMicroservice as jest.Mock) = mockCreateMicroservice;

    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    loggerSpy.mockRestore();
  });

  it('should create microservice with correct configuration', async () => {
    const { bootstrap } = await import('./main');
    const { AppModule } = await import('./app.module');

    await bootstrap();

    expect(mockCreateMicroservice).toHaveBeenCalledWith(AppModule, {
      transport: Transport.NATS,
      options: {
        servers: ['nats://localhost:4222'],
      },
    });
  });

  it('should enable shutdown hooks', async () => {
    const { bootstrap } = await import('./main');

    await bootstrap();

    expect(mockApp.enableShutdownHooks).toHaveBeenCalled();
  });

  it('should start listening', async () => {
    const { bootstrap } = await import('./main');

    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalled();
  });

  it('should log startup message', async () => {
    const { bootstrap } = await import('./main');

    await bootstrap();

    expect(loggerSpy).toHaveBeenCalledWith('Cache Microservice is running');
  });

  it('should handle errors during bootstrap', async () => {
    const { bootstrap } = await import('./main');
    const error = new Error('Bootstrap failed');
    mockCreateMicroservice.mockRejectedValue(error);

    await expect(bootstrap()).rejects.toThrow('Bootstrap failed');
  });
});
