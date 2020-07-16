import { Errors } from 'moleculer';

const { MoleculerClientError } = Errors;

export interface AuthErrorType {
  type?: string;
  message?: string;
  code?: number;
}

export type AuthErrorMessage = string | AuthErrorType;

const AuthErrorMap: { [key: string]: AuthErrorType } = {
  USER_ALREADY_LOGGED_IN: {
    type: 'USER_ALREADY_LOGGED_IN',
    message: 'User or password is invalid'
  },
  AUTHENTICATION_FAILED: {
    type: 'AUTHENTICATION_FAILED',
    message: 'Authentication failed. User or Password is invalid.'
  },
  USER_IS_NOT_ACTIVE: {
    type: 'USER_IS_NOT_ACTIVE',
    message: 'User is not active'
  },
  USER_IS_NOT_VERIFIED: {
    type: 'USER_IS_NOT_VERIFIED',
    message: 'User is not verified yet'
  },
  PASSWORD_LESS_ONLY: {
    type: 'PASSWORD_LESS_ONLY',
    message: 'This is a passwordless account! Please login without password.'
  },
  PASSWORD_LESS_NOT_AVAILABLE: {
    type: 'PASSWORD_LESS_NOT_AVAILABLE',
    message: 'Passwordless login is not available because mail transporter is not configured.'
  },
  PASSWORD_LESS_NOT_ALLOWED: {
    type: 'PASSWORD_LESS_NOT_ALLOWED',
    message: 'Passwordless login is not allowed.'
  },
  MISSING_2FA_CODE: {
    type: 'MISSING_2FA_CODE',
    message: 'Two-factor authentication is enabled. Please give the 2FA code.'
  },
  INVALID_2FA_TOKEN: {
    type: 'INVALID_2FA_TOKEN',
    message: 'Invalid 2FA token!'
  },
  SIGNUP_IS_NOT_AVAILABLE: {
    type: 'SIGNUP_NOT_AVAILABLE',
    message: 'Sign up is not available.'
  },
  EMAIL_ALREADY_EXISTS: {
    type: 'EMAIL_ALREADY_EXISTS',
    message: 'Email has already been registered.'
  },
  USERNAME_ALREADY_EXISTS: {
    type: 'USERNAME_ALREADY_EXISTS',
    message: 'Username has already been registered.'
  },
  USERNAME_CANT_EMPTY: {
    type: 'USERNAME_CANT_EMPTY',
    message: `Username can't be empty.`
  },
  PASSWORD_CANT_EMPTY: {
    type: 'PASSWORD_CANT_EMPTY',
    message: `Password can't be empty.`
  },
  USER_IS_NOT_REGISTERED: {
    type: 'USER_IS_NOT_REGISTERED',
    message: 'User is not registered yet.',
    code: 401
  },
  INVALID_TOKEN: {
    type: 'INVALID_TOKEN',
    message: 'Invalid token.',
    code: 401
  },
  EXPIRED_TOKEN: {
    type: 'EXPIRED_TOKEN',
    message: 'Token has expired.',
    code: 401
  }
};

export class AuthError extends MoleculerClientError {
  constructor(message: string, code: number, type: string) {
    super(message, code, type);
    this.name = 'AuthError';
  }

  public reject() {
    return Promise.reject(this);
  }

  public static createError(error: AuthErrorType, msg?: AuthErrorMessage) {
    if (typeof msg === 'object') {
      error = Object.assign(error, msg);
    } else if (typeof msg === 'string') {
      error.message = msg;
    }
    const { type, message, code } = error;
    return new AuthError(message, code || 400, type);
  }

  public static loggedIn(message: string): AuthError {
    return this.createError(AuthErrorMap.USER_ALREADY_LOGGED_IN, message);
  }

  public static authenticationFailed(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.AUTHENTICATION_FAILED, message);
  }

  public static userIsNotActive(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USER_IS_NOT_ACTIVE, message);
  }

  public static userIsNotVerified(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USER_IS_NOT_VERIFIED, message);
  }

  public static passwordLessOnly(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.PASSWORD_LESS_ONLY, message);
  }

  public static passwordLessNotAvailable(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.PASSWORD_LESS_NOT_AVAILABLE, message);
  }

  public static passwordLessNotAllowed(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.PASSWORD_LESS_NOT_ALLOWED, message);
  }

  public static missing2FACode(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.MISSING_2FA_CODE, message);
  }

  public static invalid2FACode(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.INVALID_2FA_TOKEN, message);
  }

  public static signUpNotAvailable(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.SIGNUP_IS_NOT_AVAILABLE, message);
  }

  public static emailAlreadyExists(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.EMAIL_ALREADY_EXISTS, message);
  }

  public static usernameAlreadyExists(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USERNAME_ALREADY_EXISTS, message);
  }

  public static usernameCantEmpty(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USERNAME_CANT_EMPTY, message);
  }

  public static passwordCantEmpty(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.PASSWORD_CANT_EMPTY, message);
  }

  public static userIsNotRegistered(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USER_IS_NOT_REGISTERED, message);
  }

  public static invalidToken(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.INVALID_TOKEN, message);
  }

  public static tokenHasExpired(message?: AuthErrorMessage): AuthError {
    return this.createError(AuthErrorMap.EXPIRED_TOKEN, message);
  }
}
