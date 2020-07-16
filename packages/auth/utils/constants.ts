// Service name (S)
export const SERVICE_GATEWAY = '@auth-gateway';
export const SERVICE_USERS = '@auth-users';
export const SERVICE_AUTH = '@auth-auth';
export const SERVICE_TOKEN = '@auth-token';
export const SERVICE_MAIL = '@auth-mail';
export const SERVICE_CONFIGS = '@auth-configs';
export const SERVICE_ACL = '@auth-acl';
export const SERVICE_ROLES = '@auth-roles';
export const SERVICE_PERMISSIONS = '@auth-perms';
// Service name (E)

export const HASH_ALGORITHM = '$2b$'; // Blowfish-based crypt Algorithm

// ROLES (S)
export const ROLE_SYSTEM = '$system';
export const ROLE_EVERYONE = '$everyone';
export const ROLE_AUTHENTICATED = '$authenticated';
export const ROLE_OWNER = '$owner';
export const ROLE_ADMIN = 'admin';
export const ROLE_USER = 'user';
// ROLES (E)

// ERROR (S)
export const ERR_ENTITY_NOT_FOUND = 'ERR_ENTITY_NOT_FOUND';
export const ERR_USER_NOT_FOUND = 'ERR_USER_NOT_FOUND';
export const ERR_ACCOUNT_NOT_VERIFIED = 'ERR_ACCOUNT_NOT_VERIFIED';
export const ERR_ACCOUNT_DISABLED = 'ERR_ACCOUNT_DISABLED';
export const ERR_USR_OR_EML_EXISTED = 'ERR_USR_OR_EML_EXISTED';
export const ERR_INVALID_TOKEN = 'INVALID_TOKEN';
export const ERR_USER_ALREADY_ENABLED = 'USER_ALREADY_ENABLED';
export const ERR_USER_ALREADY_DISABLED = 'USER_ALREADY_DISABLED';
export const ERR_INTERNALL_ERROR = 'ERR_INTERNALL_ERROR';
export const NO_LOGGED_IN_USER = 'NO_LOGGED_IN_USER';
export const ERR_USR_NOT_EXISTED = 'ERR_USR_NOT_EXISTED';
export const ERR_REQUIRED_FIELD_MISSING = 'ERR_REQUIRED_FIELD_MISSING';
export const VALIDATION_ERROR = 'VALIDATION_ERROR';
export const ERR_TOKEN_VERIFY_EMAIL = 'ERR_TOKEN_VERIFY_EMAIL';
export const ERR_EMAIL_VERIFIED = 'ERR_EMAIL_VERIFIED';
// ERROR (E)
