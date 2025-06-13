import 'dotenv/config';
import * as joi from 'joi';

interface IEnvs {
  NATS_SERVERS: string[];
  REDIS_URL: string;
}

const envsSchema = joi
  .object({
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    REDIS_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envsConfig: IEnvs = value;

export const envs = {
  nats_servers: envsConfig.NATS_SERVERS,
  redis_url: envsConfig.REDIS_URL,
};
