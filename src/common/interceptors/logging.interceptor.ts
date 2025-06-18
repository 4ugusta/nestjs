import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user } = req;
    const userId = user?.id ?? 'anonymous';
    const started = Date.now();

    this.logger.log(`[${userId}] -> ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: () =>
          this.logger.log(
            `[${userId}] <- ${method} ${url} ${Date.now() - started}ms`,
          ),
        error: (err) =>
          this.logger.error(
            `[${userId}] ! ${method} ${url} ${Date.now() - started}ms: ${err.message}`,
          ),
      }),
    );
  }
}
