import Hapi from '@hapi/hapi';
import Joi from 'joi';
import Boom from 'boom';

import UserModel, { AuthType } from '../../models/user';
import md5 from 'md5';

interface PayloadRegister {
  username: string;
  password: string;
}

const PluginAuthRegister: Hapi.Plugin<Hapi.ServerRegisterOptions> = {
  name: 'PluginAuthRegister',
  version: '1.0.0',
  register: async function (
    server: Hapi.Server,
    options: Hapi.ServerRegisterOptions
  ) {
    /// facebook auth
    server.route({
      method: 'post',
      path: '/register',
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
            409: Joi.string().description('Username exists'),
            502: Joi.string().description('Error')
          }
        },
        handler: async function (
          request: Hapi.Request,
          h: Hapi.ResponseToolkit
        ) {
          const payload: PayloadRegister = request.payload as PayloadRegister;
          const username: string = payload.username;
          const password: string = payload.password;

          const users = await UserModel.find({ username });
          if (users && users.length) {
            throw Boom.conflict('Username is exists');
          }

          await UserModel.insertMany([
            {
              username: username,
              password: md5(password),
              auth_type: AuthType.WEB
            }
          ]);

          let obj;
          if ((obj = await UserModel.login(username, password))) {
            return obj;
          }

          throw Boom.badGateway('Error register');
        }
      }
    });
  }
};

export default PluginAuthRegister;
