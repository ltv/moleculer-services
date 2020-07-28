import { I18NextMixin } from '@ltv/core/mixins/i18next.mixin';
import { enhanceResJson } from '@ltv/core/utils/json';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { ServiceSchema } from 'moleculer';
import ApiService from 'moleculer-web';
import { SERVICE_GATEWAY } from 'utils/constants';
import { routes } from './routes';
import { authenticate, getOriginEnv } from './utils';

const ApiGateway: ServiceSchema = {
  name: SERVICE_GATEWAY,
  mixins: [ApiService, I18NextMixin()],

  settings: {
    port: +process.env.APP_PORT || 3000,
    cors: {
      origin: getOriginEnv(),
      methods: ['GET', 'OPTIONS', 'POST', 'DELETE']
    },
    use: [
      helmet(),
      enhanceResJson,
      bodyParser.json({ limit: '2MB' }),
      bodyParser.urlencoded({ extended: true, limit: '2MB' })
    ],

    routes
  },

  methods: {
    authenticate
  }
};

export = ApiGateway;
