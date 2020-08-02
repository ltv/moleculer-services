import { BaseError, ErrorMessage, IError } from './base.error';

export * from './base.error';
export * from './db.error';

const AppErrorMap: { [key: string]: IError } = {
  INVALID_REQUEST: {
    type: 'INVALID_REQUEST',
    message: 'Invalid request',
    code: 400,
  },
  INVALID_REQUEST_BODY: {
    type: 'INVALID_REQUEST_BODY',
    message: 'Invalid request body',
    code: 400,
  },
  INVALID_RESPONSE_TYPE: {
    type: 'INVALID_RESPONSE_TYPE',
    message: 'Invalid response type',
    code: 500,
  },
  FORBIDDEN: {
    type: 'FORBIDDEN',
    message: 'Forbidden',
    code: 403,
  },
  BAD_REQUEST: {
    type: 'BAD_REQUEST',
    message: 'Bad Request',
    code: 400,
  },
  NOT_FOUND: {
    type: 'NOT_FOUND',
    message: 'Not Found',
    code: 404,
  },
  RATE_LIMIT_EXCEEDED: {
    type: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded',
    code: 429,
  },
};

export class AppError extends BaseError {
  constructor(message: string, code: number, type: string) {
    super(message, code, type);
    this.name = 'AppError';
  }

  public static invalidRequest(message: ErrorMessage): AppError {
    return this.createError(AppErrorMap.INVALID_REQUEST, message);
  }

  public static invalidRequestError(message: ErrorMessage): AppError {
    return this.createError(AppErrorMap.INVALID_REQUEST_BODY, message);
  }

  public static invalidResponseType(message: ErrorMessage): AppError {
    return this.createError(AppErrorMap.INVALID_RESPONSE_TYPE, message);
  }

  public static forbidden(message: ErrorMessage): AppError {
    return this.createError(AppErrorMap.FORBIDDEN, message);
  }

  public static badRequest(message: ErrorMessage): AppError {
    return this.createError(AppErrorMap.BAD_REQUEST, message);
  }

  public static notFound(message: ErrorMessage): AppError {
    return this.createError(AppErrorMap.NOT_FOUND, message);
  }

  public static rateLimitExceeded(message: ErrorMessage): AppError {
    return this.createError(AppErrorMap.RATE_LIMIT_EXCEEDED, message);
  }
}
