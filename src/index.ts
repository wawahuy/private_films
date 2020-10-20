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
import Fs from 'fs';

const folder =
  'https://drive.google.com/drive/u/2/mobile/folders/1ivE5BglKZ4XN81ydclY8PRu6WxJmspQE';

const getLinkDownload = (id: string) => {
  return `https://drive.google.com/uc?export=download&id=${id}`;
};

const hexToAscii = (str: string): string => {
  return str
    .replace(/\\x.{1,2}/g, (v) => {
      const hex = v.replace('\\x', '');
      return String.fromCharCode(parseInt(hex, 16));
    })
    .replace(/\\n/g, '');
};

const getAllFolder = async (link: string) => {
  return new Promise((resolve, reject) => {
    Request(link, (err, content) => {
      if (err) {
        reject(err);
      }

      const str = content.body
        .split(`<script>window['_DRIVE_ivd'] = '`)[1]
        .split(`';if`)[0];

      Fs.writeFileSync(Path.join(__dirname, 'a.json'), hexToAscii(str));

      const arr = JSON.parse(hexToAscii(str));
      const files = arr[0].map((file: unknown[]) => {
        const id = file[0];
        const filename = file[2];
        return { id, filename };
      });

      resolve(files);
    });
  });
};

const test = async (server: Hapi.Server) => {
  const files = (await getAllFolder(folder)) as [];

  files.map((o: { id: string; filename: string }) => {
    server.route({
      method: 'GET',
      path: `/public/decode2/test/${o.filename}`,
      options: {
        auth: false
      },
      handler: function (request, h) {
        const channel = new Stream.PassThrough();
        Request(getLinkDownload(o.id)).pipe(channel);
        return h.response(channel);
      }
    });
  });


};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
