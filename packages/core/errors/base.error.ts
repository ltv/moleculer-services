import { Errors } from 'moleculer';

export interface IError {
  type?: string;
  message?: string;
  code?: number;
  data?: any;
}

export type ErrorMessage = string | IError;

export class BaseError extends Errors.MoleculerClientError {
  constructor(message: string, code: number, type: string | undefined) {
    super(message, code || 500, type || '');
    this.name = 'BaseError';
  }

  public reject() {
    return Promise.reject(this);
  }

  public static createError(error: IError, message?: ErrorMessage) {
    if (typeof message === 'object') {
      error = Object.assign(error, message);
    } else if (typeof message === 'string') {
      error.message = message;
    }
    const { type, message: errMsg, code } = error;
    return new this(errMsg || '', code || 500, type);
  }
}
