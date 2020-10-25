import Hapi from '@hapi/hapi';
import Joi from 'joi';
import Boom from 'boom';

const PluginUserFilmsGet: Hapi.Plugin<Hapi.ServerRegisterOptions> = {
  name: 'PluginUserFilmsGet',
  version: '1.0.0',
  register: async function (
    server: Hapi.Server,
    options: Hapi.ServerRegisterOptions
  ) {
    /// facebook auth
    server.route({
      method: 'post',
      path: '/{filmID}',
      options: {
        auth: false,
        tags: ['api'],
        validate: {
          payload: Joi.object({
            username: Joi.string().min(1).max(20),
            password: Joi.string().min(3).max(20)
          }),
          params: Joi.object({
            filmID: Joi.string().min(1).max(100)
          })
        },
        response: {
          status: {
            200: Joi.object({
              token: Joi.string(),
              auth_type: Joi.string().description(
                'Type login: 0 - Facebook, 1 - Web'
              ),
              is_complete_register: Joi.boolean().description(
                'Complete register'
              ),
              is_verify: Joi.boolean().description('Account verified')
            }),
            401: Joi.string()
          }
        },
        handler: async function (
          request: Hapi.Request,
          h: Hapi.ResponseToolkit
        ) {
          throw Boom.unauthorized('Username or password failed!');
        }
      }
    });
  }
};

export default PluginUserFilmsGet;
