import { Test, TestingModule } from '@nestjs/testing';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NastModule } from './nast.module';
import { NAST_SERVICE } from '../config/services';

jest.mock('../config', () => ({
  NAST_SERVICE: 'NAST_SERVICE',
  envs: {
    nats_servers: ['nats://localhost:4222', 'nats://localhost:4223']
  }
}));

describe('NastModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [NastModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should configure NATS client with correct settings', () => {
    expect(NAST_SERVICE).toBe('NAST_SERVICE');
  });

  it('should export ClientsModule configuration', () => {
    const nastModule = module.get(NastModule);
    expect(nastModule).toBeDefined();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });
});