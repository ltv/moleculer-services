import { ActionParams } from 'moleculer';

export const AuthLoginRule: ActionParams = {
  username: { type: 'string', optional: false },
  password: { type: 'string', optional: true },
  token: { type: 'string', optional: true }
};
