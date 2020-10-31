import Mongoose from 'mongoose';
import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import Bell from '@hapi/bell';
import Path from 'path';
import PluginsV1 from './plugins';
import corsHeaders from './cors';
import NetworkService, {
  NetworkCallback,
  NetworkResponse
} from './services/network_service';
import SystemService from './services/system_service';

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
  // await test(server);
  // await test2(server);
  await test3(server);
  // await PluginsV1(server);
  await server.start();
  console.log('Server running on %s', server.info.uri);

  await SocketService.instance.establish();
};

import RequestPromise from 'request-promise';
import querystring from 'querystring';
import Request from 'request';
import { Stream } from 'stream';
import Fs from 'fs';
import SocketService from './services/socket_service';
import puppeteer from 'puppeteer';

interface Element { }
interface Node { }
interface NodeListOf<TNode = Node> { }

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

  files.map((o: { id: string; filename: string; download: string }) => {
    server.route({
      method: 'GET',
      path: `/public/decode2/test/${o.filename}`,
      options: {
        auth: false
      },
      handler: function (request, h) {
        console.log(o.filename);
        const channel = new Stream.PassThrough();
        Request(getLinkDownload(o.id))
          .pipe(channel)
          .on('end', () => {
            channel.end();
          })
          .on('error', () => console.log('error'));
        return h.response(channel);
      }
    });
  });
};

/***
 * Test 2
 */

const getDegooFolder = async (id: string) => {
  const body = {
    HashValue: id,
    Limit: 500,
    FileID: null,
    JWT: null
    // NextToken: "false,360p_014.ts"
  };
  const url = 'https://rest-api.degoo.com/shared';
  const response = await RequestPromise(url, {
    method: 'POST',
    body,
    json: true
  });
  console.log(response);
  return response.Items.map(
    (r: { ID: number; Name: string; URL: string; Data: string }) => ({
      id: r.ID,
      filename: r.Name,
      download: r.URL,
      data: Buffer.from(r.Data, 'base64').toString('utf-8')
    })
  );
};

const test2 = async (server: Hapi.Server) => {
  const files = (await getDegooFolder('FM3hVgZVud7t6s')) as [];
  console.log(files, files.length);

  files.map(
    (o: { id: string; filename: string; download: string; data: unknown }) => {
      server.route({
        method: 'GET',
        path: `/public/decode3/test/${o.filename}`,
        options: {
          auth: false
        },
        handler: function (request, h) {
          console.log(o);
          const channel = new Stream.PassThrough();

          if (!o.data) {
            Request(o.download)
              .pipe(channel)
              .on('data', (chunk) => {
                console.log(chunk);
              })
              .on('end', () => {
                channel.end();
              })
              .on('error', () => console.log('error'));
          } else {
            channel.write(o.data);
            channel.end();
          }
          return h.response(channel);
        }
      });
    }
  );
};

/**
 * Test 3
 */
interface DropboxOptions {
  linkKey: string;
  secureHash: string;
}

const getDropboxLink = (options: DropboxOptions) => {
  return `https://www.dropbox.com/sh/${options.linkKey}/${options.secureHash}?dl=0`;
};

const getDropboxFolder = async (link: string, options: DropboxOptions) => {
  let tKey = '';
  let cookie = '';
  const callback = (err: Error, response: NetworkResponse) => {
    response.headers['set-cookie']?.map((c: string) => {
      if (c.match(/^t=/g)) {
        tKey = c.split('t=')[1].split(';')[0];
      }
    });
    cookie = response.headers['set-cookie']?.join(' ') || '';
  };
  const response = await NetworkService.instance
    .get(link, { callback, userData: { filmID: 'test' } })
    .createPromise();
  console.log('tkey', tKey);
  const sp = response
    .toString('utf-8')
    .split('_PRELOAD_HANDLER"].responseReceived("')[1]
    .split('")});')[0]
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
  // Fs.writeFileSync(Path.join(__dirname, 'test.json'), sp);
  const data = JSON.parse(sp);
  const voucher = data.next_request_voucher;
  const all = [
    ...((await getDroboxFolderSub(voucher, tKey, cookie, options)) || []),
    ...data.entries
  ];
  return all.map((r: { ts: number; filename: string; href: string }) => ({
    id: r.ts,
    filename: r.filename,
    download: r.href.replace(/www\./g, 'dl.')
  }));
};

const getDroboxFolderSub = async (
  voucher: string,
  tKey: string,
  cookie: string,
  options: DropboxOptions
) => {
  if (!voucher) {
    return [];
  }

  let ret: any[] = [];
  while (voucher) {
    const nextForm = {
      is_xhr: true,
      t: tKey,
      link_key: options.linkKey,
      link_type: 's',
      secure_hash: options.secureHash,
      sub_path: '',
      voucher
    };
    const formData = querystring.stringify(nextForm);
    const contentLength = formData.length;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Content-Length': contentLength,
      cookie
    };
    const r2 = await NetworkService.instance
      .post('https://www.dropbox.com/list_shared_link_folder_entries', {
        body: formData,
        headers,
        userData: { filmID: 'test' }
      })
      .createPromise();
    const data = JSON.parse(r2.toString('utf-8'));
    voucher = data.next_request_voucher;
    ret = [...ret, ...data.entries];
  }
  return ret;
};

const test3 = async (server: Hapi.Server) => {
  server.route({
    method: 'GET',
    path: `/info`,
    options: {
      auth: false
    },
    handler: async function (request, h) {
      return {
        host: process.env.HEROKU_APP_NAME,
        cached: NetworkService.instance.size / 1024 + 'KB',
        system: await SystemService.instance.info()
      };
    }
  });

  server.route({
    method: 'GET',
    path: `/test2`,
    options: {
      auth: false
    },
    handler: async function (request, h) {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.goto('https://google.com');
      const b = await page.screenshot({
        encoding: 'binary'
      });
      await browser.close();
      return b;
    }
  });

  server.route({
    method: 'GET',
    path: `/log/network`,
    options: {
      auth: false
    },
    handler: async function (request, h) {
      return NetworkService.instance.log;
    }
  });

  const options: DropboxOptions = {
    linkKey: 'kqlansowid2jxn7',
    secureHash: 'AAAgJr7w5DQAlVxQz8jikQcaa'
  };

  const dir = Path.join(__dirname, '/cache.json');
  if (!Fs.existsSync(dir)) {
    const folder = getDropboxLink(options);
    const files = (await getDropboxFolder(folder, options)) as [];
    console.log(files, files.length);
    Fs.writeFileSync(dir, JSON.stringify(files));
  }
  const files = JSON.parse(Fs.readFileSync(dir).toString('utf-8'));

  files.map(
    (o: { id: string; filename: string; download: string; data: unknown }) => {
      server.route({
        method: 'GET',
        path: `/public/decode4/test/${o.filename}`,
        options: {
          auth: false
        },
        handler: function (request, h) {
          const channel = new Stream.PassThrough();
          const r = NetworkService.instance.get(o.download, {
            userData: { filmID: 'test' }
          });
          channel.on('close', () => {
            if (!r.isDone()) {
              r.abort();
            }
          });
          r.createStream().pipe(channel);
          return h.response(channel);
        }
      });
    }
  );
};

NetworkService.instance.on('new_request', () => console.log('new request'));
NetworkService.instance.on('old_request', () => console.log('old_request'));

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
