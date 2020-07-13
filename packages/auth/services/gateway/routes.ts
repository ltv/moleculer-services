import { SERVICE_AUTH } from 'utils/constants';

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
  }
];
