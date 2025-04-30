import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { RedisClientOptions } from "redis";
import { envs } from "../config/envs";
import { createKeyv } from '@keyv/redis';

const redisConfig = CacheModule.registerAsync<RedisClientOptions>({
    isGlobal: true,
    useFactory: async () => ({
        stores: [
            createKeyv(envs.redis_url)
        ]
    }),
});

@Module({
    imports: [redisConfig],
    exports: [redisConfig]
})
export class RedisModule { }