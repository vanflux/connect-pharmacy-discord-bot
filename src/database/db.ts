import { Knex, knex } from "knex";
import { getConfig } from "../config";

export class DB {
  public client!: Knex;
  
  public async initialize() {
    console.log('[Database] Initializing');
    const { database: { host, pass: password, port, user } } = getConfig();

    this.client = knex({
      client: 'mysql2',
      connection: {
        host,
        port,
        user,
        password,
        database: 'connectpharmacy'
      },
    });
    await this.client.raw('select 1 from dual');
    console.log('[Database] Initialized');
  }
}

export const db = new DB();
