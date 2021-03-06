import { AuthSpecialRole, ServiceMetadata } from '@ltv/moleculer-core';
import { AuthError } from 'errors';
import pick from 'lodash.pick';
import { User } from 'models/auth';
import { Context } from 'moleculer';
import { SERVICE_AUTH } from 'utils/constants';

interface ClientRequest {
  originalUrl: string;
  method: string;
  headers: any;
}
/**
 * Authenticate the request
 *
 * @param {Context} ctx
 * @param {Object} route
 * @param {IncomingRequest} req
 * @returns {Promise}
 */
export async function authenticate(
  ctx: Context<any, ServiceMetadata & { user: User }>,
  _: any,
  req: ClientRequest
) {
  let token;

  // Get JWT token from Authorization header
  if (!token) {
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
  }

  ctx.meta.roles = [AuthSpecialRole.EVERYONE];

  let user!: User;

  if (token) {
    user = await ctx.call(`v1.${SERVICE_AUTH}.resolveToken`, { token });
    if (user) {
      this.logger.info('User authenticated via JWT.', {
        username: user.username,
        email: user.email,
        id: user._id
      });

      ctx.meta.user = pick(user, ['_id', 'email']) as User;
      ctx.meta.token = token;
      ctx.meta.userId = user._id.toString();
      ctx.meta.roles = [user.role];
      ctx.meta.tenantId = `1`; // temporary fixed

      return ctx.meta.user;
    }
    return undefined;
  }
  return AuthError.invalidToken().reject();
}

export function getOriginEnv() {
  const { CORS_ORIGINS } = process.env;
  if (!CORS_ORIGINS || ['true', 'false', true, false].indexOf(CORS_ORIGINS) !== -1) {
    return CORS_ORIGINS == 'true';
  }
  return CORS_ORIGINS.replace(/\s+/, '').split(',');
}
