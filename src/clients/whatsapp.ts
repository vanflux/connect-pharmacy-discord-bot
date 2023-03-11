import { Client, Message, SocketClient } from "@open-wa/wa-automate";
import EventEmitter from "events";
import { configService } from "../services/config";

export declare interface Whatsapp {
  on(event: 'message', listener: (message: Message) => void): this;
}

export class Whatsapp extends EventEmitter {
  private socket: any;
  private connecting = false;
  private connected = false;
  public client!: Client;

  async initialize() {
    console.log('[Whatsapp] Initializing');
    await this.reload();
    console.log('[Whatsapp] Initialized');
  }

  private async disconnect() {
    this.socket?.disconnect();
  }

  // Why this function is soooo big? SocketClient doesn't seem to have any good strategy for disconnection or reconnection
  // Not a stable feature yet :(
  private async connect() {
    return new Promise<boolean>((resolve) => {
      try {
        if (this.connecting || this.connected) return resolve(false);
        const socket = configService.get('whatsapp.socket');
        if (!socket) return resolve(false);
        this.connecting = true;
        const id = Math.floor(Math.random() * 999999999);
        console.log('[Whatsapp] Trying to connect, id =', id);
        const client = new SocketClient(socket) as SocketClient & Client;
        this.client = client;
        this.socket = client.socket;
        client.onAnyMessage(async message => this.emit('message', message));
        const onConnect = () => {
          console.log('[Whatsapp] Connected, id =', id);
          this.connecting = false;
          this.connected = true;
          client['_connected']();
          resolve(true);
        };
        const onClose = (err?: Error | string) => {
          console.log('[Whatsapp] Close, id =', id, ', err/reason =', err);
          this.connected = false;
          client.socket.disconnect();
          if (err === 'io client disconnect') return resolve(false);
          setTimeout(() => {
            console.log('[Whatsapp] Re-calling connect, id =', id);
            this.connecting = false;
            this.connect();
          }, 5000);
          resolve(false);
        };
        client.socket.on('connect', onConnect);
        client.socket.on('connect_error', onClose);
        client.socket.on('disconnect', onClose);
      } catch (err) {
        console.log('[Whatsapp] Connect err:', err);
        this.connecting = false;
        resolve(false);
      }
    });
  }

  async reload() {
    await this.disconnect();
    return await this.connect();
  }
}

export const whatsapp = new Whatsapp();
