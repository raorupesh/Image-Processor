import { ZodError } from 'zod';
export class HttpError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'HttpError';
    }
}
export function notFoundHandler(_request, _response, next) {
    next(new HttpError(404, 'Resource not found'));
}
export function errorHandler(error, _request, response, _next) {
    if (error instanceof ZodError) {
        response.status(400).json({
            error: 'Validation failed',
            details: error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message
            }))
        });
        return;
    }
    if (error instanceof HttpError) {
        response.status(error.statusCode).json({ error: error.message });
        return;
    }
    if (error instanceof Error) {
        response.status(500).json({ error: error.message });
        return;
    }
    response.status(500).json({ error: 'Unexpected server error' });
}
