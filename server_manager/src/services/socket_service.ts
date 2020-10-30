import Hapi from '@hapi/hapi';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import Ws from 'ws';
import Url from 'url';
import { log } from '../core/log';
import { IKeyPair } from '../interface/IKeyPair';

export type SocketSendOptions = {
  mask?: boolean;
  binary?: boolean;
  compress?: boolean;
  fin?: boolean;
};

class SocketService {
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

  private onUpgrade(request: IncomingMessage, socket: Socket, head: Buffer) {
    const pathname = Url.parse(request.url || '').pathname;
    if (pathname === this.path) {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  }

  private onConnection(socket: Ws, request: IncomingMessage) {
    socket.on('message', this.onMessage.bind(this, socket));
    socket.on('close', this.onClose.bind(this, socket));
    socket.on('error', this.onError.bind(this, socket));
  }

  private onMessage(socket: Ws, data: Ws.Data) {
    this.broadcast(data);
  }

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
}

export default SocketService;
