import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NAST_SERVICE, envs } from '../config';

const nastConfig = ClientsModule.register([
  {
    name: NAST_SERVICE,
    transport: Transport.NATS,
    options: {
      servers: envs.nats_servers,
    },
  },
]);
@Module({
  imports: [nastConfig],
  exports: [nastConfig],
})
export class NastModule {}
