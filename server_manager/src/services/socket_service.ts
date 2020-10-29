import Hapi from '@hapi/hapi';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import Ws from 'ws';
import Url from 'url';
import { log } from '../core/log';

class SocketService {
  private static _instance: SocketService;
  private wss!: Ws.Server;

  static get instance() {
    if (!SocketService._instance) {
      SocketService._instance = new SocketService();
    }
    return SocketService._instance;
  }

  async establish(server: Hapi.Server) {
    this.wss = new Ws.Server({ noServer: true });
    this.wss.on('connection', this.onConnection.bind(this));
    server.listener.on('upgrade', this.onUpgrade.bind(this));
  }

  private onUpgrade(request: IncomingMessage, socket: Socket, head: Buffer) {
    const pathname = Url.parse(request.url || '').pathname;
    if (pathname === '/ws/manager') {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  }

  private onConnection(socket: Ws, request: IncomingMessage) {
    log('new connect!');
  }
}

export default SocketService;
