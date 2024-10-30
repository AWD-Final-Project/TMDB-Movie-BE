// validation-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse() as any;

        let message = 'Validation failed';
        if (Array.isArray(exceptionResponse.message) && exceptionResponse.message.length > 0) {
            message = exceptionResponse.message[0]; // Get the first validation error message
        } else if (typeof exceptionResponse.message === 'string') {
            message = exceptionResponse.message;
        }

        response.status(status).json({
            statusCode: status,
            error: 'Bad Request',
            message: message,
        });
    }
}
