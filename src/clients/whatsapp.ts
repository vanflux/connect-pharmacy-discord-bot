import { Client, Message, SocketClient } from "@open-wa/wa-automate";
import EventEmitter from "events";
import { getConfig } from "../config";

export declare interface Whatsapp {
  on(event: 'message', listener: (message: Message) => void): this;
}

export class Whatsapp extends EventEmitter {
  public client!: Client;

  async initialize() {
    console.log('[Whatsapp] Initializing');
    const { waSocket } = getConfig();
    this.client = await SocketClient.connect(waSocket) as unknown as Client;
    this.client.onAnyMessage(async message => this.emit('message', message));
    console.log('[Whatsapp] Initialized');
  }
}

export const whatsapp = new Whatsapp();
