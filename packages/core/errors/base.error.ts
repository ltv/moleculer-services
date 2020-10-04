import { Errors } from "moleculer";

export interface IError<DataType = any> {
  type?: string;
  message?: string;
  code?: number | string;
  data?: DataType;
}

export type ErrorMessage = string | IError;

function convertCode(code: string | number) {
  try {
    return parseInt(`${code}`);
  } catch (_) {
    return 500;
  }
}

export class BaseError extends Errors.MoleculerClientError {
  constructor(
    message: string,
    code: number | string,
    type: string | undefined,
    data?: any
  ) {
    super(message, convertCode(code), type || "", data);
    this.name = "BaseError";
  }

  public reject() {
    return Promise.reject(this);
  }

  public static createError(error: IError, message?: ErrorMessage) {
    if (typeof message === "object") {
      error = Object.assign(error, message);
    } else if (typeof message === "string") {
      error.message = message;
    }
    const { type, message: errMsg, code } = error;
    return new this(errMsg || "", code || 500, type, error.data);
  }
}
