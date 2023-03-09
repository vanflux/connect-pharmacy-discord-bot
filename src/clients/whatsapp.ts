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
    const { whatsapp: { socket, optional } } = getConfig();
    try {
      this.client = await SocketClient.connect(socket) as unknown as Client;
      this.client.onAnyMessage(async message => this.emit('message', message));
    } catch (error) {
      console.log('[Whatsapp] Could not connect');
      if (!optional) throw error;
    }
    console.log('[Whatsapp] Initialized');
  }
}

export const whatsapp = new Whatsapp();
