import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AppModule } from '../src/app.module';
import { INestMicroservice } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { envs } from '../src/common/config/envs';
import { NastModule } from '../src/common/transports/nast.module';

describe('Cache E2E', () => {
  let app: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        NastModule
      ]
    }).compile();

    app = module.createNestMicroservice({
      transport: Transport.NATS,
      options: {
        servers: envs.nats_servers,
      },
    });

    await app.listen();

    client = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: { servers: envs.nats_servers }
    });
    await app.listen();
  });

  afterAll(async () => {
    await client.close();
    await app.close();

    // Ensure all connections are closed
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  beforeEach(async () => {
    // Clear cache before each test
    await firstValueFrom(client.send('clear_cache', {}));
  });

  describe('Cache Operations', () => {
    it('should set and get a string value', async () => {
      const key = 'test-string-key';
      const value = 'test-string-value';

      // Set value
      await firstValueFrom(client.send('set_cache', { key, value }));

      // Get value
      const result = await firstValueFrom(client.send('get_cache', key));
      expect(result).toBe(value);
    });

    it('should set and get an object value', async () => {
      const key = 'test-object-key';
      const value = { name: 'test', data: { nested: true }, count: 42 };

      // Set value
      await firstValueFrom(client.send('set_cache', { key, value }));

      // Get value
      const result = await firstValueFrom(client.send('get_cache', key));
      expect(result).toEqual(value);
    });

    it('should set value with TTL', async () => {
      const key = 'test-ttl-key';
      const value = 'test-ttl-value';
      const ttl = 1000    // 1 second

      // Set value with TTL
      await firstValueFrom(client.send('set_cache', { key, value, ttl }));

      // Get value immediately
      const immediateResult = await firstValueFrom(client.send('get_cache', key));
      expect(immediateResult).toBe(value);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Get value after TTL
      const expiredResult = await firstValueFrom(client.send('get_cache', key));
      expect(expiredResult).toBeNull();
    });

    it('should delete a specific key', async () => {
      const key = 'test-delete-key';
      const value = 'test-delete-value';

      // Set value
      await firstValueFrom(client.send('set_cache', { key, value }));

      // Verify it exists
      const beforeDelete = await firstValueFrom(client.send('get_cache', key));
      expect(beforeDelete).toBe(value);

      // Delete key
      await firstValueFrom(client.send('delete_cache', key));

      // Verify it's deleted
      const afterDelete = await firstValueFrom(client.send('get_cache', key));
      expect(afterDelete).toBeNull();
    });

    it('should handle non-existent keys gracefully', async () => {
      const nonExistentKey = 'non-existent-key-12345';

      const result = await firstValueFrom(client.send('get_cache', nonExistentKey));
      expect(result).toBeNull();
    });

    it('should clear all cache', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const values = ['value1', 'value2', 'value3'];

      // Set multiple values
      for (let i = 0; i < keys.length; i++) {
        await firstValueFrom(client.send('set_cache', { key: keys[i], value: values[i] }));
      }

      // Verify all values exist
      for (let i = 0; i < keys.length; i++) {
        const result = await firstValueFrom(client.send('get_cache', keys[i]));
        expect(result).toBe(values[i]);
      }

      // Clear all cache
      await firstValueFrom(client.send('clear_cache', {}));

      // Verify all values are cleared
      for (const key of keys) {
        const result = await firstValueFrom(client.send('get_cache', key));
        expect(result).toBeNull();
      }
    });

    it('should handle concurrent operations', async () => {
      const operations: Promise<any>[] = [];
      const baseKey = 'concurrent-key-';
      const baseValue = 'concurrent-value-';

      // Create multiple concurrent set operations
      for (let i = 0; i < 10; i++) {
        operations.push(
          firstValueFrom(client.send('set_cache', {
            key: `${baseKey}${i}`,
            value: `${baseValue}${i}`
          }))
        );
      }

      // Execute all operations concurrently
      await Promise.all(operations);

      // Verify all values were set correctly
      for (let i = 0; i < 10; i++) {
        const result = await firstValueFrom(client.send('get_cache', `${baseKey}${i}`));
        expect(result).toBe(`${baseValue}${i}`);
      }
    });

    it('should handle large data values', async () => {
      const key = 'large-data-key';
      const largeValue = {
        data: 'x'.repeat(10000), // 10KB string
        array: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item-${i}` })),
        metadata: {
          created: new Date().toISOString(),
          size: 'large',
          nested: {
            deep: {
              value: 'very deep'
            }
          }
        }
      };

      // Set large value
      await firstValueFrom(client.send('set_cache', { key, value: largeValue }));

      // Get large value
      const result = await firstValueFrom(client.send('get_cache', key));
      expect(result).toEqual(largeValue);
      expect(result?.data).toHaveLength(10000);
      expect(result?.array).toHaveLength(1000);
    });

    it('should handle special characters in keys and values', async () => {
      const specialKey = 'key:with-special.chars_123@#$%^&*()';
      const specialValue = {
        text: 'Special chars: àáâãäåæçèéêëìíîïñòóôõöùúûüý',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        unicode: '🚀🎉💻🔥⭐',
        json: '{"nested": "value", "array": [1, 2, 3]}'
      };

      // Set value with special characters
      await firstValueFrom(client.send('set_cache', { key: specialKey, value: specialValue }));

      // Get value with special characters
      const result = await firstValueFrom(client.send('get_cache', specialKey));
      expect(result).toEqual(specialValue);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty key gracefully', async () => {
      const emptyKey = '';
      const value = 'test-value';

      // This should not throw an error, but behavior depends on implementation
      await expect(
        firstValueFrom(client.send('set_cache', { key: emptyKey, value }))
      ).resolves.not.toThrow();
    });

    it('should handle null/undefined values by not storing them', async () => {
      const key = 'null-value-key';

      // First set a real value
      await firstValueFrom(client.send('set_cache', { key, value: 'real-value' }));
      const realValue = await firstValueFrom(client.send('get_cache', key));
      expect(realValue).toBe('real-value');

      // Set null value should delete the key
      await firstValueFrom(client.send('set_cache', { key, value: null }));
      const nullResult = await firstValueFrom(client.send('get_cache', key));
      expect(nullResult).toBeNull();

      // Set a value again
      await firstValueFrom(client.send('set_cache', { key, value: 'another-value' }));
      const anotherValue = await firstValueFrom(client.send('get_cache', key));
      expect(anotherValue).toBe('another-value');

      // Set undefined value should also delete the key
      await firstValueFrom(client.send('set_cache', { key, value: undefined }));
      const undefinedResult = await firstValueFrom(client.send('get_cache', key));
      expect(undefinedResult).toBeNull();
    });
  });
});