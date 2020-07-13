import Email from 'email-templates';
import fs from 'fs';
import defaultsDeep from 'lodash.defaultsdeep';
import isFunction from 'lodash.isfunction';
import omit from 'lodash.omit';
import { Errors, ServiceSchema } from 'moleculer';
import nodemailer from 'nodemailer';
import { htmlToText } from 'nodemailer-html-to-text';
import path from 'path';

const { MoleculerError, MoleculerRetryableError } = Errors;

export const MailMixin: ServiceSchema = {
  name: 'mail',
  settings: {
    // Sender default e-mail address
    from: null,

    /* SMTP: https://nodemailer.com/smtp/
    transport: {
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "",
        pass: ""
      }
    },
    */

    /* for Gmail service - https://github.com/nodemailer/nodemailer/blob/master/lib/well-known/services.json
    transport: {
      service: "gmail",
      auth: {
        user: "",
        pass: ""
      }
    },
    */

    // Convert HTML body to text
    htmlToText: true,

    // Templates folder
    templateFolder: null,

    // Common data
    data: {},
  },
  actions: {
    /**
     * Send an email to recipients
     */
    send: {
      handler(ctx) {
        const data = defaultsDeep(ctx.params.data || {}, this.settings.data);
        if (ctx.params.template) {
          const templateName = ctx.params.template;
          // Use templates
          const template = this.getTemplate(templateName);
          if (template) {
            // Render template
            return template
              .render(templateName, data || {})
              .then((html: string) => {
                const params = omit(ctx.params, ['template', 'locale', 'data']);

                // Send e-mail
                return this.send({ ...params, html });
              });
          }
          return Promise.reject(
            new MoleculerError('Missing e-mail template: ' + templateName)
          );
        } else {
          // Send e-mail
          const params = omit(ctx.params, ['template', 'locale', 'data']);
          return this.send(params);
        }
      },
    },
  },

  /**
   * Methods
   */
  methods: {
    /**
     * Get template renderer by name
     *
     * @param {any} templateName
     * @returns
     */
    getTemplate(templateName) {
      if (this.templates[templateName]) {
        return this.templates[templateName];
      }

      const templatePath: any = path.join(
        this.settings.templateFolder,
        templateName
      );
      if (fs.existsSync(templatePath)) {
        this.templates[templateName] = new Email({
          views: { root: this.settings.templateFolder },
        } as any);

        return this.templates[templateName];
      }
    },

    /**
     * Send an email
     *
     * @param {Object} msg
     * @returns
     */
    send(msg) {
      return new Promise(
        (resolve: (value?: any) => void, reject: (reason?: any) => any) => {
          this.logger.debug(
            `Sending email to ${msg.to} with subject '${msg.subject}'...`
          );

          if (!msg.from) msg.from = `${this.settings.from}`.replace(/\\/, '');

          if (this.transporter) {
            this.transporter.sendMail(msg, (err: Error, info: any) => {
              if (err) {
                this.logger.warn('Unable to send email: ', err);
                reject(
                  new MoleculerRetryableError(
                    'Unable to send email! ' + err.message
                  )
                );
              } else {
                this.logger.info('Email message sent.', info.response);
                console.log('email sent :>> ', info.response);
                resolve(info);
              }
            });
          } else
            return reject(
              new MoleculerError(
                'Unable to send email! Invalid mailer transport: ' +
                  this.settings.transport
              )
            );
        }
      );
    },
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
    this.templates = {};
    if (this.settings.templateFolder) {
      if (!fs.existsSync(this.settings.templateFolder)) {
        /* istanbul ignore next */
        this.logger.warn(
          'The templateFolder is not exists! Path:',
          this.settings.templateFolder
        );
      }
    }

    if (isFunction(this.createTransport)) {
      this.transporter = this.createTransport();
    } else {
      if (!this.settings.transport) {
        this.logger.error('Missing transport configuration!');
        return;
      }

      this.transporter = nodemailer.createTransport(this.settings.transport);
    }

    if (this.transporter) {
      if (this.settings.htmlToText)
        this.transporter.use('compile', htmlToText());
    }
  },
};
