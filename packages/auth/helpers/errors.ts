import { Errors } from 'moleculer';

const { MoleculerClientError } = Errors;

export class UnauthorizedError {
  public name: string;
  public message: string;
  public code: any;
  public inner: any;
  public status: number;

  constructor(code: any, error: any) {
    this.name = 'UnauthorizedError';
    this.message = error.message;
    Error.call(this, error.message);
    Error.captureStackTrace(this, this.constructor);
    this.code = code;
    this.status = 401;
    this.inner = error;
  }
}
