import { ActionParams } from 'moleculer';

export const AuthLoginRule: ActionParams = {
  email: { type: 'string', optional: false },
  password: { type: 'string', optional: true },
  admin: { type: 'string', optional: true },
  token: { type: 'string', optional: true }
};
