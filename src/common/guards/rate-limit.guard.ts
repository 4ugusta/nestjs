import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  /**
   * Use the authenticated user id when available so different users
   * behind the same IP are tracked independently. Fallback to IP when
   * unauthenticated.
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id ?? req.ip;
  }

  canActivate(context: ExecutionContext): Promise<boolean> {
    return super.canActivate(context);
  }
}
