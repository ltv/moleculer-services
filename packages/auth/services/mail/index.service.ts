import { MailMixin } from '@app/core/mixins/mail.mixin';
import { BaseService } from '@app/types';
import { UserRole } from 'models';
import { Event, Service } from 'moleculer-decorators';
import path from 'path';
import { SERVICE_MAIL, SERVICE_USERS } from 'utils/constants';

const templateFolder = path.resolve(__dirname, 'templates').toString();

const {
  MAIL_MJ_HOST: host,
  MAIL_MJ_PORT: port,
  MAIL_MJ_APIKEY_PUBLIC: user,
  MAIL_MJ_APIKEY_PRIVATE: pass,
  MAIL_MJ_SENDER: from,
  HOST_DOMAIN
} = process.env;

@Service({
  name: SERVICE_MAIL,
  mixins: [MailMixin],
  settings: {
    from,
    transport: {
      host,
      port,
      auth: {
        user,
        pass
      }
    },
    templateFolder
  }
})
class MailService extends BaseService {
  @Event()
  [`${SERVICE_USERS}.createdUserMail`](mail: any) {
    if (mail.user.role === UserRole.ADMIN) {
      return;
    }
    const verifyLink: string = `http://${HOST_DOMAIN}/verify?emlConfToken=${mail.token}`;
    this.broker.call('mail.send', {
      to: mail.user.email,
      subject: 'Moleculer Auth - Confirmation link',
      template: 'register-confirm',
      data: { verifyLink }
    });
  }
}

export = MailService;
