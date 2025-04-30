import * as joi from 'joi';

describe('envs.ts', () => {
    let envsSchema: joi.ObjectSchema;
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = process.env;
        envsSchema = joi.object({
            PORT: joi.number().required(),
            NATS_SERVERS: joi.array().items(joi.string()).required(),
        }).unknown(true);
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should validate environment variables successfully', () => {
        process.env.PORT = '3000';
        process.env.NATS_SERVERS = 'nats://localhost:4222,nats://localhost:4223';

        const { error, value } = envsSchema.validate({
            ...process.env,
            NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
        });

        expect(error).toBeUndefined();
        expect(value).toEqual({
            ...process.env,
            PORT: 3000,
            NATS_SERVERS: ['nats://localhost:4222', 'nats://localhost:4223']
        });
    });

    it('should throw an error if environment variables are invalid', () => {
        process.env.PORT = 'invalid_port';
        process.env.NATS_SERVERS = 'nats://localhost:4222,nats://localhost:4223';

        const { error } = envsSchema.validate({
            ...process.env,
            NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
        });

        expect(error).toBeDefined();
        expect(error?.message).toContain('"PORT" must be a number');
    });

    it('should throw an error if required environment variables are missing', () => {
        process.env.PORT = '3000';
        delete process.env.NATS_SERVERS;

        const { error } = envsSchema.validate({
            ...process.env,
            NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
        });

        expect(error).toBeDefined();
        expect(error?.message).toContain('"NATS_SERVERS" is required');
    });
});