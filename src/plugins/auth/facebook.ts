import Hapi from '@hapi/hapi';
import Boom from 'boom';
import Joi, { string } from 'joi';
import ModelUser, { IUserDocument } from '../../models/user';

interface IFbProfile {
  id: string;
  displayName: string;
  email?: string;
  picture?: { data?: { url?: string } };
}

const pluginAuthFacebook: Hapi.Plugin<Hapi.ServerRegisterOptions> = {
  name: 'PluginAuthFacebook',
  version: '1.0.0',
  register: async function (
    server: Hapi.Server,
    options: Hapi.ServerRegisterOptions
  ) {
    /// facebook auth
    server.route({
      method: 'get',
      path: '/facebook',
      options: {
        tags: ['api'],
        notes: ['Gọi api trên iframe hoặc trên cửa sổ riêng biệt'],
        auth: {
          strategy: 'facebook',
          mode: 'try'
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
          try {
            if (!request.auth.isAuthenticated) {
              throw Boom.unauthorized(
                'Authentication failed due to: ' + request.auth.error.message
              );
            }

            const credentials = request.auth.credentials;
            const profile: IFbProfile = credentials.profile as IFbProfile;
            const users = await ModelUser.find({ fb_id: profile.id });

            /// register
            if (!users || !users.length) {
              await ModelUser.insertMany([
                {
                  fb_id: profile.id,
                  display_name: profile.displayName,
                  avatar: profile.picture?.data?.url || '',
                  email: profile.email || ''
                }
              ]);
            }

            /// login
            const obj = await ModelUser.loginByFb(profile.id);
            if (!obj) {
              throw 'error';
            }

            return obj;
          } catch (e) {
            console.log(e);
            throw Boom.unauthorized('Authentication failed!');
          }
        }
      }
    });
  }
};

export default pluginAuthFacebook;
