import Hapi from '@hapi/hapi';
import Joi from 'joi';
import Boom from 'boom';

import UserModel from '../../models/user';

interface PayloadLogin {
  username: string;
  password: string;
}

const PluginAuthLogin: Hapi.Plugin<Hapi.ServerRegisterOptions> = {
  name: 'PluginAuthLogin',
  version: '1.0.0',
  register: async function (
    server: Hapi.Server,
    options: Hapi.ServerRegisterOptions
  ) {
    /// facebook auth
    server.route({
      method: 'post',
      path: '/login',
      options: {
        auth: false,
        tags: ['api'],
        validate: {
          payload: Joi.object({
            username: Joi.string().min(1).max(20),
            password: Joi.string().min(3).max(20)
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
          const payload: PayloadLogin = request.payload as PayloadLogin;
          const username: string = payload.username;
          const password: string = payload.password;

          let obj;
          if ((obj = await UserModel.login(username, password))) {
            return obj;
          }

          throw Boom.unauthorized('Username or password failed!');
        }
      }
    });
  }
};

export default PluginAuthLogin;
