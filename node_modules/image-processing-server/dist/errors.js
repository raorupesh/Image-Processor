export class HttpError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = new.target.name;
    }
}
export class BadRequestError extends HttpError {
    constructor(message) {
        super(message, 400);
    }
}
export class UnsupportedMediaTypeError extends HttpError {
    constructor(message) {
        super(message, 415);
    }
}
export class PayloadTooLargeError extends HttpError {
    constructor(message) {
        super(message, 413);
    }
}
