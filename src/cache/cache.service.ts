import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async get(key: string) {
        return await this.cacheManager.get(key);
    }

    async set(key: string, value: any, ttl?: number) {
        return await this.cacheManager.set(key, value, ttl);
    }

    async del(key: string) {
        return await this.cacheManager.del(key);
    }

    async clear() {
        return await this.cacheManager.clear();
    }
}