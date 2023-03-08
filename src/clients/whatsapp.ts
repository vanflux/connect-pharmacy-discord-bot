import { Client, create, Message } from "@open-wa/wa-automate";
import EventEmitter from "events";

export declare interface Whatsapp {
  on(event: 'message', listener: (message: Message) => void): this;
}

export class Whatsapp extends EventEmitter {
  public client!: Client;

  async initialize() {
    this.client = await create();
    this.client.onAnyMessage(async message => this.emit('message', message));    
  }
}

export const whatsapp = new Whatsapp();
