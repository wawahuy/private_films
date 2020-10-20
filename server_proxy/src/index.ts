import Mongoose from 'mongoose';
import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import Bell from '@hapi/bell';
import Path from 'path';
import PluginsV1 from './plugins';
import corsHeaders from './cors';

const validateJwt = async function (decoded?: unknown, request?: unknown) {
  return {
    isValid: false
  };
};

const configStrategy = async (server: Hapi.Server) => {
  server.auth.strategy('jwt', 'jwt', {
    key: process.env.AUTH_KEY || '10026',
    validate: validateJwt,
    verifyOptions: { algorithms: ['HS256'] },
    cookieKey: 'yourkeyhereok',
    headerKey: 'authorization',
    tokenType: 'Bearer'
  });

  server.auth.default('jwt');
};

const configSwagger = async (server: Hapi.Server) => {
  const swaggerOptions = {
    info: {
      title: 'Test API Documentation',
      version: '1.0'
    },
    host: process.env.ENDPOINT,
    securityDefinitions: {
      jwt: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        'x-keyPrefix': 'Bearer '
      }
    },
    security: [{ jwt: [] }]
  };

  await server.register([
    require('hapi-auth-jwt2'),
    Bell,
    Inert,
    Vision,
    {
      plugin: require('hapi-swagger'),
      options: swaggerOptions
    }
  ]);
};

const publicResources = async (server: Hapi.Server) => {
  server.route({
    method: 'GET',
    path: '/public/{param*}',
    options: {
      auth: false
    },
    handler: {
      directory: {
        path: Path.join(__dirname, '../public')
      }
    }
  });
};

const init = async () => {
  /**
   * Config HAPI
   */
  const server = Hapi.server({
    port: process.env.PORT,
    routes: {
      cors: corsHeaders
    }
  });

  await configSwagger(server);
  await configStrategy(server);

  /// routes
  await publicResources(server);
  await test(server);
  await PluginsV1(server);
  await server.start();
  console.log('Server running on %s', server.info.uri);

  /**
   * Config mongooes
   */
  // await Mongoose.connect(process.env.MONGO_URI as string, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   useFindAndModify: false,
  //   useCreateIndex: true
  // });
  // Mongoose.Promise = global.Promise;
  // console.log('Mongo connected!');
};

import Request from 'request';
import { Stream } from 'stream';

const t =
  'https://drive.google.com/uc?export=download&id=1UJcmTfdIHH4vRPeICsdqeAUApnkaFXWm';

const test = async (server: Hapi.Server) => {
  server.route({
    method: 'GET',
    path: '/public/decode/test/playlist.m3u8',
    options: {
      auth: false
    },
    handler: function (request, h) {
      const channel = new Stream.PassThrough();
      Request(t).pipe(channel);
      return h.response(channel);
    }
  });
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
