import { Context } from '@ltv/moleculer-core';
import { ClientRequest } from 'http';
import { SERVICE_AUTH, SERVICE_TOKEN, SERVICE_USERS } from 'utils/constants';

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
    },
    onBeforeCall(
      ctx: Context,
      _: any,
      req: ClientRequest & { headers: { [key: string]: string } }
    ) {
      this.logger.info('onBeforeCall in protected route');
      ctx.meta.clientIp =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.remoteAddress;

      this.logger.info('Request from client: ', ctx.meta.clientIp);
    }
  },
  {
    path: '/api/v1/auth',
    etag: true,
    camelCaseNames: true,
    authentication: true,
    autoAliases: false,
    aliases: {
      'GET /me': `v1.${SERVICE_USERS}.me`,
      'DELETE /logout': `v1.${SERVICE_AUTH}.logout`,
      'POST /renew': `v1.${SERVICE_TOKEN}.renew`
    }
  }
];
