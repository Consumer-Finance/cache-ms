import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async get(key: string) {
        const result = await this.cacheManager.get(key);
        return result;
    }

    async set(key: string, value: any, ttl?: number) {
        // Don't store null or undefined values
        if (value === null || value === undefined) {
            return this.del(key); // Remove the key if it exists
        }
        return await this.cacheManager.set(key, value, ttl);
    }

    async del(key: string) {
        return await this.cacheManager.del(key);
    }

    async clear() {
        return await this.cacheManager.clear();
    }
}