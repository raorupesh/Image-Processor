export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnsupportedMediaTypeError extends HttpError {
  constructor(message: string) {
    super(message, 415);
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message: string) {
    super(message, 413);
  }
}
