import { db } from "../database/db";

export interface VoiceActivity {
  id: number;
  userId: string;
  channelId: string;
  startTime: Date;
  endTime?: Date;
}

export interface VoiceActivityUserRankItem {
  userId: string;
  total: number;
}

const tableName = 'voice_activity';

export class VoiceRankService {
  public async initialize() {
    console.log('[VoiceRankService] Initializing');
    if (!await db.client.schema.hasTable(tableName)) {
      await db.client.schema.createTable(tableName, table => {
        table.increments('id');
        table.string('user_id', 128).notNullable();
        table.string('channel_id', 128).notNullable();
        table.dateTime('start_time').notNullable();
        table.dateTime('end_time');
      });
    }
    console.log('[VoiceRankService] Initialized');
  }

  public async getNotEndedActivityOfUserOnChannel(userId: string, channelId: string) {
    const rows = await db.client
      .table(tableName)
      .select('id', 'user_id as userId', 'channel_id as channelId', 'start_time as startTime', 'end_time as endTime')
      .where('user_id', userId)
      .where('channel_id', channelId)
      .whereNull('end_time')
      .orderBy('start_time', 'desc')
      .limit(1);
    const voiceActivity = rows?.[0] as VoiceActivity | undefined;
    return voiceActivity;
  }

  public async startActivity(userId: string, channelId: string, startTime: Date) {
    await db.client
      .table(tableName)
      .insert({ user_id: userId, channel_id: channelId, start_time: startTime });
  }

  public async endActivity(id: number, endTime = new Date()) {
    await db.client
      .table(tableName)
      .update({ end_time: endTime })
      .where('id', id);
  }

  public async getAllPoints() {
    const rows = await db.client
      .table(tableName)
      .select(db.client.raw('sum(timestampdiff(second, start_time, coalesce(end_time, now()))) as total'))
      .from(tableName);
    const points = rows?.[0]?.total;
    if (points === undefined) return;
    return Number(points);
  }

  public async getUserRank() {
    const rows = await db.client
      .table(tableName)
      .select<VoiceActivityUserRankItem[]>('user_id as userId', db.client.raw('sum(timestampdiff(second, start_time, coalesce(end_time, now()))) as total'))
      .from(tableName)
      .groupBy('userId')
      .orderBy('total', 'desc')
      .limit(5);
    return rows.map(({ userId, total }) => ({ userId, total: Number(total) }));
  }

  public async getUserPoints(userId: string) {
    const rows = await db.client
      .table(tableName)
      .select('user_id as userId', db.client.raw('sum(timestampdiff(second, start_time, coalesce(end_time, now()))) as total'))
      .from(tableName)
      .groupBy('userId')
      .where('user_id', userId);
    const points = rows?.[0]?.total;
    if (points === undefined) return;
    return Number(points);
  }
}

export const voiceRankService = new VoiceRankService();
