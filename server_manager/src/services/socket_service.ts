import Hapi from '@hapi/hapi';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import Ws from 'ws';
import Url from 'url';
import { EventEmitter } from 'events';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { log } from '../core/log';
import { IKeyPair } from '../interface/IKeyPair';
import '../core/avl_find';

export type SocketSendOptions = {
  mask?: boolean;
  binary?: boolean;
  compress?: boolean;
  fin?: boolean;
};

export interface SockDetail {
  host?: string;
}

class SocketService extends EventEmitter {
  private static _instance: SocketService;
  private wss!: Ws.Server;
  readonly path = '/ws/manager';

  static get instance() {
    if (!SocketService._instance) {
      SocketService._instance = new SocketService();
    }
    return SocketService._instance;
  }

  get server() {
    return this.wss;
  }

  async establish(server: Hapi.Server) {
    this.wss = new Ws.Server({ noServer: true });
    this.wss.on('connection', this.onConnection.bind(this));
    server.listener.on('upgrade', this.onUpgrade.bind(this));
    log('[Socket]', `Socket listening at ${this.path}`);
  }

  private async onUpgrade(
    request: IncomingMessage,
    socket: Socket,
    head: Buffer
  ) {
    const url = Url.parse(request.url || '', true);
    const pathname = url.pathname;
    if (pathname === this.path) {
      // auth
      const token = url.query['token'] as string;
      const data = (await this.auth(token)) as SockDetail;
      if (!data || !data.host) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // upgrade socket
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });

      log('[Socket]', 'Establish connect ', data);
    } else {
      socket.destroy();
    }
  }

  private onConnection(socket: Ws, request: IncomingMessage) {
    socket.on('message', this.onMessage.bind(this, socket));
    socket.on('close', this.onClose.bind(this, socket));
    socket.on('error', this.onError.bind(this, socket));
  }

  private onMessage(socket: Ws, data: Ws.Data) {}

  private onClose(socket: Ws, code: number, reason: string) {}

  private onError(socket: Ws, err: Error) {}

  broadcast(
    data: Ws.Data,
    options?: SocketSendOptions,
    cb?: (err?: Error) => void
  ) {
    this.wss.clients.forEach((socket: Ws) => {
      socket.send(data, options || {}, cb);
    });
  }

  private async auth(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        process.env.SOCKET_JWT_SECRET as string,
        (err, decode) => {
          if (err) {
            resolve(false);
          }
          resolve(decode);
        }
      );
    });
  }
}

export default SocketService;
