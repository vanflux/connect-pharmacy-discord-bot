import { db } from "../database/db";

export interface Sprint {
  id: number;
  num: number;
  startTime: Date;
  endTime: Date;
}

const allColumns = [
  'id',
  'num as userId',
  'start_time as startTime',
  'end_time as endTime',
];

const tableName = 'sprints';

export class SprintService {
  public async initialize() {
    console.log('[SprintService] Initializing');
    if (!await db.client.schema.hasTable(tableName)) {
      await db.client.schema.createTable(tableName, table => {
        table.increments('id');
        table.integer('num').notNullable();
        table.dateTime('start_time').notNullable();
        table.dateTime('end_time').notNullable();
      });
    }
    console.log('[SprintService] Initialized');
  }

  public async getSprints() {
    return await db.client
      .select<Sprint[]>(allColumns)
      .from(tableName);
  }

  public async getSprintByNum(num: number) {
    const sprints = await db.client
      .select<Sprint[]>(allColumns)
      .from(tableName)
      .where('num', num);
    return sprints?.[0];
  }

  public async getCurrentSprint() {
    const now = Date.now();
    const sprints = await this.getSprints();
    return sprints.find(sprint => sprint.startTime.getTime() <= now && now <= sprint.endTime.getTime());
  }
}

export const sprintService = new SprintService();
