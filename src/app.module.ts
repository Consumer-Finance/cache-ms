import { Module } from '@nestjs/common';
import { RedisModule } from './common/cache/redis.module';
import { NastModule } from './common/transports/nast.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    RedisModule,
    NastModule,
    CacheModule
  ]
})
export class AppModule { }
