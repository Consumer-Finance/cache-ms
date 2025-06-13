import { createKeyv } from '@keyv/redis';
import { envs } from '../config/envs';

jest.mock('@keyv/redis');
jest.mock('../config/envs', () => ({
  envs: {
    redis_url: 'redis://localhost:6379',
  },
}));

describe('RedisModule Configuration', () => {
  const mockKeyv = {
    on: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createKeyv as jest.Mock).mockReturnValue(mockKeyv);
  });

  it('should use correct redis url from envs', () => {
    expect(envs.redis_url).toBe('redis://localhost:6379');
  });

  it('should create keyv instance with redis url', () => {
    const keyv = createKeyv(envs.redis_url);

    expect(createKeyv).toHaveBeenCalledWith('redis://localhost:6379');
    expect(keyv).toBe(mockKeyv);
  });

  it('should support event listeners setup', () => {
    const keyv = createKeyv(envs.redis_url);
    const connectHandler = jest.fn();
    const errorHandler = jest.fn();

    keyv.on('connect', connectHandler);
    keyv.on('error', errorHandler);

    expect(mockKeyv.on).toHaveBeenCalledWith('connect', connectHandler);
    expect(mockKeyv.on).toHaveBeenCalledWith('error', errorHandler);
  });
});
