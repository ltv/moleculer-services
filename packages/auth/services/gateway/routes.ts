import { SERVICE_AUTH, SERVICE_USERS } from 'utils/constants';

export const routes: any[] = [
  {
    path: '/api/v1/auth',
    etag: true,
    camelCaseNames: true,
    authentication: false,
    autoAliases: false,
    aliases: {
      'POST /register': `v1.${SERVICE_AUTH}.register`,
      'POST /login': `v1.${SERVICE_AUTH}.login`
    }
  },
  {
    path: '/api/v1/auth/me',
    etag: true,
    camelCaseNames: true,
    authentication: true,
    autoAliases: false,
    aliases: {
      'GET /': `v1.${SERVICE_USERS}.me`
    }
  }
];
