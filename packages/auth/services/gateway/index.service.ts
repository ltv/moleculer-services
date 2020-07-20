import { I18NextMixin } from '@app/core/mixins/i18next.mixin';
import { enhanceResJson } from '@app/core/utils/json';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { ServiceSchema } from 'moleculer';
import ApiService from 'moleculer-web';
import { SERVICE_GATEWAY } from 'utils/constants';
import { routes } from './routes';
import { authenticate } from './utils';

const ApiGateway: ServiceSchema = {
  name: SERVICE_GATEWAY,
  mixins: [ApiService, I18NextMixin()],

  settings: {
    port: +process.env.APP_PORT || 3000,
    cors: {
      origin: '*'
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
