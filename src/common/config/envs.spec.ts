import * as joi from 'joi';

describe('envs.ts', () => {
    let envsSchema: joi.ObjectSchema;
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = { ...process.env };
        envsSchema = joi.object({
            NATS_SERVERS: joi.array().items(joi.string()).required(),
            REDIS_URL: joi.string().required()
        }).unknown(true);
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('should validate environment variables successfully', () => {
        process.env.NATS_SERVERS = 'nats://localhost:4222,nats://localhost:4223';
        process.env.REDIS_URL = 'redis://localhost:6379';

        const { error, value } = envsSchema.validate({
            ...process.env,
            NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
        });

        expect(error).toBeUndefined();
        expect(value.NATS_SERVERS).toEqual(['nats://localhost:4222', 'nats://localhost:4223']);
        expect(value.REDIS_URL).toBe('redis://localhost:6379');
    });

    it('should throw an error if REDIS_URL is missing', () => {
        process.env.NATS_SERVERS = 'nats://localhost:4222';
        delete process.env.REDIS_URL;

        const { error } = envsSchema.validate({
            ...process.env,
            NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
        });

        expect(error).toBeDefined();
        expect(error?.message).toContain('"REDIS_URL" is required');
    });

    it('should throw an error if NATS_SERVERS is missing', () => {
        const testEnv = { 
            REDIS_URL: 'redis://localhost:6379'
        };

        const { error } = envsSchema.validate(testEnv);

        expect(error).toBeDefined();
        expect(error?.message).toContain('"NATS_SERVERS" is required');
    });

    it('should handle single NATS server', () => {
        process.env.NATS_SERVERS = 'nats://localhost:4222';
        process.env.REDIS_URL = 'redis://localhost:6379';

        const { error, value } = envsSchema.validate({
            ...process.env,
            NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
        });

        expect(error).toBeUndefined();
        expect(value.NATS_SERVERS).toEqual(['nats://localhost:4222']);
    });
});