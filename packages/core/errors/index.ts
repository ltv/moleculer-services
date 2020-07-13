import { Errors } from 'moleculer';

const { MoleculerError, MoleculerClientError } = Errors;

export const ERR_NO_TOKEN = 'NO_TOKEN';
export const ERR_INVALID_TOKEN = 'INVALID_TOKEN';
export const ERR_UNABLE_DECODE_PARAM = 'UNABLE_DECODE_PARAM';
export const ERR_ORIGIN_NOT_FOUND = 'ORIGIN_NOT_FOUND';
export const ERR_ORIGIN_NOT_ALLOWED = 'ORIGIN_NOT_ALLOWED';

/**
 * Invalid request
 *
 * @class InvalidRequestError
 * @extends {Error}
 */
export class InvalidRequestError extends MoleculerError {
  /**
   * Creates an instance of InvalidRequestBodyError.
   *
   * @param {any} body
   * @param {any} error
   *
   * @memberOf InvalidRequestBodyError
   */
  constructor(message?: string, code?: string, data?: any) {
    super(message || 'Invalid request', 400, code || 'INVALID_REQUEST', data);
  }
}

/**
 * Invalid request body
 *
 * @class InvalidRequestBodyError
 * @extends {Error}
 */
export class InvalidRequestBodyError extends MoleculerError {
  /**
   * Creates an instance of InvalidRequestBodyError.
   *
   * @param {any} body
   * @param {any} error
   *
   * @memberOf InvalidRequestBodyError
   */
  constructor(body: any, error: any) {
    super('Invalid request body', 400, 'INVALID_REQUEST_BODY', {
      body,
      error,
    });
  }
}

/**
 * Invalid response type
 *
 * @class InvalidResponseTypeError
 * @extends {Error}
 */
export class InvalidResponseTypeError extends MoleculerError {
  /**
   * Creates an instance of InvalidResponseTypeError.
   *
   * @param {String} dataType
   *
   * @memberOf InvalidResponseTypeError
   */
  constructor(dataType: string) {
    super(`Invalid response type '${dataType}'`, 500, 'INVALID_RESPONSE_TYPE', {
      dataType,
    });
  }
}

/**
 * Unauthorized HTTP error
 *
 * @class UnAuthorizedError
 * @extends {Error}
 */
export class UnAuthorizedError extends MoleculerError {
  /**
   * Creates an instance of UnAuthorizedError.
   *
   * @param {String} type
   * @param {any} data
   *
   * @memberOf UnAuthorizedError
   */
  constructor(type: string, data: any) {
    super('Unauthorized', 401, type || ERR_INVALID_TOKEN, data);
  }
}

/**
 * Forbidden HTTP error
 *
 * @class ForbiddenError
 * @extends {Error}
 */
export class ForbiddenError extends MoleculerError {
  /**
   * Creates an instance of ForbiddenError.
   *
   * @param {String} message
   * @param {any} data
   *
   * @memberOf ForbiddenError
   */
  constructor(message: string, data: any) {
    super(message, 403, 'Forbidden', data);
  }
}

/**
 * Bad request HTTP error
 *
 * @class BadRequestError
 * @extends {Error}
 */
export class BadRequestError extends MoleculerError {
  /**
   * Creates an instance of BadRequestError.
   *
   * @param {String} message
   * @param {any} data
   *
   * @memberOf BadRequestError
   */
  constructor(message: string, data: any) {
    super(message, 400, 'Bad request', data);
  }
}

/**
 * Not found HTTP error
 *
 * @class NotFoundError
 * @extends {Error}
 */
export class NotFoundError extends MoleculerError {
  /**
   * Creates an instance of NotFoundError.
   *
   * @param {String} type
   * @param {any} data
   *
   * @memberOf NotFoundError
   */
  constructor(type: string, data: any) {
    super('Not found', 404, type || 'NOT_FOUND', data);
  }
}

/**
 * Rate limit exceeded HTTP error
 *
 * @class RateLimitExceeded
 * @extends {Error}
 */
export class RateLimitExceeded extends MoleculerClientError {
  /**
   * Creates an instance of RateLimitExceeded.
   *
   * @param {String} type
   * @param {any} data
   *
   * @memberOf RateLimitExceeded
   */
  constructor(type: string, data: any) {
    super('Rate limit exceeded', 429, type, data);
  }
}

export class DatabaseError extends MoleculerClientError {
  constructor(err: Error) {
    // TODO: Handle Error
    super(err.message, 400, 'BAD REQUEST', err);
  }
}

/**
 * Balance not enough
 *
 * @class NoBalanceError
 * @extends {Error}
 */
export class NoBalanceError extends MoleculerError {
  /**
   * Creates an instance of NoBalanceError.
   *
   * @param {String} type
   * @param {any} data
   *
   * @memberOf NotFoundError
   */
  constructor(type: string, data: any) {
    super('Balance is not enough', 402, type || 'NO_BALANCE', data);
  }
}
