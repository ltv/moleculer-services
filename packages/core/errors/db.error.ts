import { BaseError, IError } from './base.error';

const DbErrorMap: { [key: string]: IError } = {
  NOT_FOUND_ENTITY: {
    type: 'NOT_FOUND_ENTITY',
    message: 'Could not found entity with provided id',
  },
};

export class DatabaseError extends BaseError {
  constructor(message: string, code: number, type: string) {
    super(message, code, type);
    this.name = 'DatabaseError';
  }

  public static notFoundEntity(message?: IError): DatabaseError {
    return this.createError(DbErrorMap.NOT_FOUND_ENTITY, message);
  }
}
