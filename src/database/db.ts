import { Knex, knex } from "knex";
import { secretService } from "../services/secret";

export class DB {
  public client!: Knex;
  
  public async initialize() {
    console.log('[Database] Initializing');
    const { database: { host, pass: password, port, user } } = secretService.getSecrets();

    this.client = knex({
      client: 'mysql2',
      connection: {
        timezone: '+00:00',
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
