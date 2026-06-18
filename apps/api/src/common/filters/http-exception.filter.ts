import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    let message: unknown
    if (exception instanceof HttpException) {
      message = exception.getResponse()
    } else {
      this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : String(exception))
      message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (exception instanceof Error ? exception.message : 'Internal server error')
    }

    response.status(status).json({ success: false, error: message })
  }
}
