import { ActionParams } from 'moleculer';

export const RegisterUserRule: ActionParams = {
  password: { type: 'string', min: 8 },
  email: { type: 'email' },
  username: { type: 'string', min: 3, optional: true },
  firstName: { type: 'string', min: 2, optional: true },
  lastName: { type: 'string', min: 2, optional: true },
  avatar: { type: 'string', optional: true }
};
