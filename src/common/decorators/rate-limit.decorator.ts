import { Throttle } from '@nestjs/throttler';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

/**
 * Wrapper around the built in `Throttle` decorator to keep the
 * existing `@RateLimit` API while delegating the heavy lifting to
 * `@nestjs/throttler`.
 */
export const RateLimit = (options: RateLimitOptions) =>
  Throttle({
    default: {
      limit: options.limit,
      ttl: Math.ceil(options.windowMs / 1000),
    },
  });
