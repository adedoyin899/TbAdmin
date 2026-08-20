import { Redis } from 'ioredis';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { pool } from '../db/connection.js';

class CacheService {
  private redisClient: InstanceType<typeof Redis> | null = null;
  private isRedisConnected = false;
  private memoryCache = new Map<string, { data: string; expiresAt: number }>();

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    try {
      this.redisClient = new Redis(ENV.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: (times: number) => {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts in development
          }
          return Math.min(times * 100, 2000);
        },
      });

      this.redisClient.on('connect', () => {
        this.isRedisConnected = true;
        logger.info('Connected to Redis cache');
      });

      this.redisClient.on('error', (err: any) => {
        if (this.isRedisConnected) {
          logger.warn('Redis connection lost, falling back to memory/database cache:', err.message);
        }
        this.isRedisConnected = false;
      });

      this.redisClient.connect().catch(() => {
        logger.info('Redis not available locally. Operating with in-memory & database cache fallback.');
      });
    } catch {
      this.isRedisConnected = false;
    }
  }

  /**
   * Fetch cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // 1. Try Redis
      if (this.isRedisConnected && this.redisClient) {
        const val = await this.redisClient.get(key);
        if (val) {
          return JSON.parse(val) as T;
        }
      }

      // 2. Try In-Memory Cache
      const memEntry = this.memoryCache.get(key);
      if (memEntry) {
        if (Date.now() < memEntry.expiresAt) {
          return JSON.parse(memEntry.data) as T;
        }
        this.memoryCache.delete(key);
      }

      // 3. Try PostgreSQL dashboard_cache table
      try {
        const dbRes = await pool.query(
          'SELECT data FROM dashboard_cache WHERE cache_key = $1 AND expires_at > NOW() LIMIT 1',
          [key]
        );
        if (dbRes.rows.length > 0) {
          const data = dbRes.rows[0].data;
          // populate memory cache
          this.memoryCache.set(key, {
            data: JSON.stringify(data),
            expiresAt: Date.now() + 15 * 60 * 1000,
          });
          return data as T;
        }
      } catch {}

      return null;
    } catch (err) {
      logger.error(`Cache get error for key "${key}":`, err);
      return null;
    }
  }

  /**
   * Set cached value with TTL (default 900 seconds / 15 minutes)
   */
  async set<T>(key: string, data: T, ttlSeconds = 900): Promise<void> {
    const stringified = JSON.stringify(data);
    const expiresAtMs = Date.now() + ttlSeconds * 1000;

    try {
      // 1. Set in Redis
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.setex(key, ttlSeconds, stringified);
      }

      // 2. Set in Memory Cache
      this.memoryCache.set(key, {
        data: stringified,
        expiresAt: expiresAtMs,
      });

      // 3. Upsert in PostgreSQL dashboard_cache asynchronously
      pool.query(
        `
        INSERT INTO dashboard_cache (cache_key, data, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '${ttlSeconds} seconds')
        ON CONFLICT (cache_key) DO UPDATE
        SET data = EXCLUDED.data,
            expires_at = EXCLUDED.expires_at;
        `,
        [key, data]
      ).catch(() => {});
    } catch (err) {
      logger.error(`Cache set error for key "${key}":`, err);
    }
  }

  /**
   * Delete specific cache key
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch {}
    }
    pool.query('DELETE FROM dashboard_cache WHERE cache_key = $1', [key]).catch(() => {});
  }

  /**
   * Flush all dashboard caches
   */
  async flushAll(): Promise<void> {
    this.memoryCache.clear();
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch {}
    }
    pool.query('TRUNCATE TABLE dashboard_cache').catch(() => {});
  }
}

export const cacheService = new CacheService();
