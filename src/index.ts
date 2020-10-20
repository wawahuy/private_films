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

import RequestPromise from 'request-promise';
import Request from 'request';
import { Stream } from 'stream';
import Fs from 'fs';

const folder = '1G6kpL9T7o02iu1dIUubx-PpzZrK5zVmR';

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

const getLinkFolder = (id: string) => {
  const link = `https://www.googleapis.com/drive/v2/files?q=%27${id}%27+in+parents&key=AIzaSyDCoxr_vhugHhdij4E1Fewk7U-ySMEey8Y`;
  return link;
};

const getAllFolder = async (link: string) => {
  let result: unknown[] = [];
  try {
    while (link) {
      const data = JSON.parse(await RequestPromise(link));
      const items = data.items;
      const nextLink = data.nextLink;

      const arr = items.map((item: any) => {
        const { originalFilename, id, downloadUrl } = item;
        return {
          id,
          filename: originalFilename,
          download: downloadUrl
        };
      });
      result = result.concat(arr);
      link = nextLink + '&key=AIzaSyDCoxr_vhugHhdij4E1Fewk7U-ySMEey8Y';
    }
  } catch (e) {
    console.log(e);
  }

  return result;
};

const test = async (server: Hapi.Server) => {
  const files = (await getAllFolder(getLinkFolder(folder))) as [];
  console.log(files, files.length);

  files.map((o: { id: string; filename: string, download: string }) => {
    server.route({
      method: 'GET',
      path: `/public/decode2/test/${o.filename}`,
      options: {
        auth: false
      },
      handler: function (request, h) {
        const channel = new Stream.PassThrough();
        Request(o.download).pipe(channel);
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
