import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cache, createCache } from 'cache-manager';

/**
 * Simple wrapper around `cache-manager` providing an interface
 * that can be swapped for a distributed store (e.g. Redis) in
 * production deployments. Uses in-memory storage by default.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private cache: Cache = createCache();

  async onModuleDestroy() {
    await this.cache.disconnect();
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    await this.cache.set(key, value, ttlSeconds * 1000);
    this.logger.debug(`Set cache entry ${key} (ttl ${ttlSeconds}s)`);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return (await this.cache.get<T>(key)) ?? undefined;
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.del(key);
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    return (await this.cache.get(key)) !== undefined;
  }
}
