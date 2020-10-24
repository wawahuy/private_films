import Hapi from '@hapi/hapi';
import Joi from 'joi';
import Boom from 'boom';

const schemaCompleteWebPayload = Joi.object({
  display_name: Joi.string().required(),
  email: Joi.string(),
  phone: Joi.string()
});

const schemaCompleteWebParams = {
  id: Joi.string()
};

const PluginAuthComplete: Hapi.Plugin<Hapi.ServerRegisterOptions> = {
  name: 'PluginAuthComplete',
  version: '1.0.0',
  register: async function (
    server: Hapi.Server,
    options: Hapi.ServerRegisterOptions
  ) {
    // verify web
    server.route({
      method: 'update',
      path: '/complete/{id}/web',
      options: {
        auth: 'jwt',
        tags: ['api'],
        validate: {
          payload: schemaCompleteWebPayload,
          params: schemaCompleteWebParams
        },
        handler: async function (
          request: Hapi.Request,
          h: Hapi.ResponseToolkit
        ) {
          return 'ok';
        }
      }
    });
  }
};

export default PluginAuthComplete;
