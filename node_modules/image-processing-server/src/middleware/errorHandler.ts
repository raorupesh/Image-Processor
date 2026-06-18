import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function notFoundHandler(_request: Request, _response: Response, next: NextFunction): void {
  next(new HttpError(404, 'Resource not found'));
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
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
