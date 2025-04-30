import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';
import { NastModule } from '../common/transports/nast.module';

@Module({
  controllers: [CacheController],
  providers: [CacheService],
  imports: [
    NastModule
  ]
})
export class CacheModule { }
