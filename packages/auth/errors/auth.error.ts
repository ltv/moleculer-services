import { BaseError, ErrorMessage, IError } from '@ltv/moleculer-core';

const AuthErrorMap: { [key: string]: IError } = {
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
  },
  NO_PERMISSION: {
    type: 'NO_PERMISSION',
    message: 'You have no permissions to perform this action.',
    code: 403
  },
  ACCOUNT_HAS_BEEN_HACKED: {
    type: 'ACCOUNT_HAS_BEEN_HACKED',
    message:
      'Someone has been used your account. We already logged out all your sessions, please login again and change your password.',
    code: 403
  }
};

export class AuthError extends BaseError {
  constructor(message: string, code: number, type: string) {
    super(message, code, type);
    this.name = 'AuthError';
  }

  public static loggedIn(message: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USER_ALREADY_LOGGED_IN, message);
  }

  public static authenticationFailed(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.AUTHENTICATION_FAILED, message);
  }

  public static userIsNotActive(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USER_IS_NOT_ACTIVE, message);
  }

  public static userIsNotVerified(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USER_IS_NOT_VERIFIED, message);
  }

  public static passwordLessOnly(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.PASSWORD_LESS_ONLY, message);
  }

  public static passwordLessNotAvailable(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.PASSWORD_LESS_NOT_AVAILABLE, message);
  }

  public static passwordLessNotAllowed(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.PASSWORD_LESS_NOT_ALLOWED, message);
  }

  public static missing2FACode(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.MISSING_2FA_CODE, message);
  }

  public static invalid2FACode(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.INVALID_2FA_TOKEN, message);
  }

  public static signUpNotAvailable(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.SIGNUP_IS_NOT_AVAILABLE, message);
  }

  public static emailAlreadyExists(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.EMAIL_ALREADY_EXISTS, message);
  }

  public static usernameAlreadyExists(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USERNAME_ALREADY_EXISTS, message);
  }

  public static usernameCantEmpty(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USERNAME_CANT_EMPTY, message);
  }

  public static passwordCantEmpty(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.PASSWORD_CANT_EMPTY, message);
  }

  public static userIsNotRegistered(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.USER_IS_NOT_REGISTERED, message);
  }

  public static invalidToken(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.INVALID_TOKEN, message);
  }

  public static tokenHasExpired(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.EXPIRED_TOKEN, message);
  }

  public static noPermission(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.NO_PERMISSION, message);
  }

  public static accountHasBeenHacked(message?: ErrorMessage): AuthError {
    return this.createError(AuthErrorMap.ACCOUNT_HAS_BEEN_HACKED, message);
  }
}
