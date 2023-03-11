import { ResultSetHeader } from "mysql2";
import { db } from "../database/db";

type ConfigObject = { [name: string]: string | undefined };

const tableName = 'configs';

export class ConfigService {
  private updateMinimumInterval = 10 * 1000;
  private lastUpdate = 0;
  private configByName!: ConfigObject;

  public async initialize() {
    console.log('[ConfigService] Initializing');
    if (!await db.client.schema.hasTable(tableName)) {
      await db.client.schema.createTable(tableName, table => {
        table.increments('id');
        table.string('name', 256).unique({ indexName: 'config_name_idx' }).notNullable();
        table.string('value', 1024);
        table.timestamps(true, true);
      });
    }
    await this.loadConfigs();
    console.log('[ConfigService] Initialized');
  }

  private async loadConfigs() {
    console.log('[ConfigService] Loading configs');
    this.lastUpdate = Date.now();
    const rows = await db.client
      .table(tableName)
      .select('name', 'value');
    this.configByName = rows.reduce((obj, item) => {
      obj[item.name] = item.value;
      return obj;
    }, {} as ConfigObject);
  }

  private async saveItem(name: string, value?: string) {
    const date = new Date();
    const rows = await db.client.raw<ResultSetHeader[]>(`
      INSERT INTO :table: (name, value, created_at, updated_at)
      VALUES(:name, :value, :createdAt, :updatedAt)
      ON DUPLICATE KEY UPDATE value = :value, updated_at = :updatedAt
    `, {
      table: tableName,
      name,
      value,
      createdAt: date,
      updatedAt: date,
    });
    const id = rows?.[0]?.insertId;
    this.configByName[name] = value;
    return id;
  }

  get(name: string) {
    if (Date.now() - this.lastUpdate > this.updateMinimumInterval) this.loadConfigs();
    return this.configByName[name];
  }

  async set(name: string, value: string) {
    await this.saveItem(name, value);
  }
}

export const configService = new ConfigService();
