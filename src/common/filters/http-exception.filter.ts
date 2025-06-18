import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const msg =
      (exception.getResponse() as any)?.message || exception.message || 'Error';

    if (status >= 500) {
      this.logger.error(`HTTP ${status} ${request.method} ${request.url}: ${msg}`);
    } else {
      this.logger.warn(`HTTP ${status} ${request.method} ${request.url}: ${msg}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: msg,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
