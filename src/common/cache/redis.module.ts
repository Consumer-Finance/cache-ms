import { CacheModule } from "@nestjs/cache-manager";
import { Module, Logger } from "@nestjs/common";
import { RedisClientOptions } from "redis";
import { envs } from "../config/envs";
import { createKeyv } from '@keyv/redis';

const logger = new Logger('RedisModule');

const redisConfig = CacheModule.registerAsync<RedisClientOptions>({
    isGlobal: true,
    useFactory: async () => {
        const keyv = createKeyv(envs.redis_url);
        keyv.on('connect', () => {
            logger.log('Successfully connected to Redis');
        });
        keyv.on('error', (error) => {
            logger.error('Failed to connect to Redis:', error);
            throw new Error('Failed to connect to Redis: ' + error.message);
        });
        return {
            stores: [keyv]
        };
    },
});

@Module({
    imports: [redisConfig],
    exports: [redisConfig]
})
export class RedisModule { }