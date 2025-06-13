import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './common/config';

export async function bootstrap() {
  const logger = new Logger('Cache-Main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.nats_servers,
      },
    },
  );

  app.enableShutdownHooks();

  await app.listen();

  logger.log(`Cache Microservice is running`);
}
bootstrap();
