import Hapi from '@hapi/hapi';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import Ws from 'ws';
import Url from 'url';
import { log } from '../core/log';
import { IKeyPair } from '../interface/IKeyPair';

class SocketService {
  private static _instance: SocketService;
  private client!: Ws;
  private test!: NodeJS.Timeout;

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
    this.client = new Ws(process.env.SOCKET_MANAGER as string);
    this.client.onopen = this.onOpen.bind(this);
    this.client.onclose = this.onClose.bind(this);
    this.client.onerror = this.onError.bind(this);
    this.client.onmessage = this.onMessage.bind(this);
    this.test = setInterval(() => {
      this.client.send(new Date().toISOString());
    }, 2000);
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
    clearInterval(this.test);
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
