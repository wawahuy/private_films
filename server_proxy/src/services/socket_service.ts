import Hapi from '@hapi/hapi';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import Ws from 'ws';
import Url from 'url';
import jwt from 'jsonwebtoken';
import { log } from '../core/log';
import { IKeyPair } from '../interface/IKeyPair';

class SocketService {
  private static _instance: SocketService;
  private client!: Ws;

  static get instance() {
    if (!SocketService._instance) {
      SocketService._instance = new SocketService();
    }
    return SocketService._instance;
  }

  async establish() {
    this.connect();
  }

  connect() {
    const payload = {
      host: process.env.SOCKET_CLIENT
    };
    const token = jwt.sign(payload, process.env.SOCKET_JWT_SECRET as string);
    const options: Ws.ClientOptions = {
      headers: {
        sock_auth: token
      }
    };
    this.client = new Ws(process.env.SOCKET_MANAGER as string, options);
    this.client.onopen = this.onOpen.bind(this);
    this.client.onclose = this.onClose.bind(this);
    this.client.onerror = this.onError.bind(this);
    this.client.onmessage = this.onMessage.bind(this);
  }

  onOpen() {
    log('[Socket]', 'connected!');
  }

  onClose(e: Ws.CloseEvent) {
    log(
      '[Socket]',
      'closed. Reconnect will be attempted in 2 second.',
      e.reason
    );
    setTimeout(() => this.connect(), 2000);
  }

  onError(err: Ws.ErrorEvent) {
    log('[Socket]', err);
    this.client.close();
  }

  onMessage(event: Ws.MessageEvent) {
    log('[Socket]', 'message: ', event.data);
  }

  send(data: Ws.Data) {
    if (this.client && this.client.readyState == Ws.OPEN) {
      this.client.send(data);
    }
  }
}

export default SocketService;
