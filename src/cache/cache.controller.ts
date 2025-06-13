import { Controller } from '@nestjs/common';
import { CacheService } from './cache.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @MessagePattern('get_cache')
  async get(key: string) {
    return await this.cacheService.get(key);
  }

  @MessagePattern('set_cache')
  async set(data: { key: string; value: any; ttl?: number }) {
    return await this.cacheService.set(data.key, data.value, data.ttl);
  }

  @MessagePattern('delete_cache')
  async delete(key: string) {
    return await this.cacheService.del(key);
  }

  @MessagePattern('clear_cache')
  async clear() {
    return await this.cacheService.clear();
  }
}
