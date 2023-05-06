import { db } from "../database/db";

export interface User {
  id: number;
  discordUserId?: string;
  trelloMemberId?: string;
  gitlabUserId?: number;
  gitlabUsername?: string;
  name: string;
  agesLevel: number;
}

export type CreateUserDto = Omit<User, 'id'>;

export type UpdateUserDto = Partial<CreateUserDto>;

const allColumns = [
  'id',
  'discord_user_id as discordUserId',
  'trello_member_id as trelloMemberId',
  'gitlab_user_id as gitlabUserId',
  'gitlab_username as gitlabUsername',
  'name',
  'ages_level as agesLevel',
];

const tableName = 'users';

export class UserService {
  public async initialize() {
    console.log('[UserService] Initializing');
    if (!await db.client.schema.hasTable(tableName)) {
      await db.client.schema.createTable(tableName, table => {
        table.increments('id');
        table.string('discord_user_id', 128);
        table.string('trello_member_id', 128);
        table.integer('gitlab_user_id');
        table.string('gitlab_username', 128);
        table.string('name', 128).unique({ indexName: 'user_name_idx' }).notNullable();
        table.integer('ages_level').notNullable();
      });
    }
    console.log('[UserService] Initialized');
  }

  private convertUserToDbObj(user: Partial<User>) {
    return {
      discord_user_id: user.discordUserId,
      trello_member_id: user.trelloMemberId,
      gitlab_user_id: user.gitlabUserId,
      gitlab_username: user.gitlabUsername,
      name: user.name,
      ages_level: user.agesLevel,
    };
  }

  public async create(createUserDto: CreateUserDto) {
    const rows = await db.client
      .table(tableName)
      .insert(this.convertUserToDbObj(createUserDto));
    const id = rows[0];
    return id;
  }

  public async update(id: number, updateUserDto: UpdateUserDto) {
    await db.client
      .table(tableName)
      .update(this.convertUserToDbObj(updateUserDto))
      .where('id', id);
  }

  public async getAll(): Promise<User[]> {
    const rows = await db.client
      .table(tableName)
      .select<User[]>(allColumns);
    return rows;
  }

  public async getById(id: number): Promise<User | undefined> {
    const rows = await db.client
      .table(tableName)
      .select<User[]>(allColumns)
      .where('id', id)
      .limit(1);
    return rows?.[0];
  }

  public async deleteById(id: number) {
    await db.client
      .table(tableName)
      .delete()
      .where('id', id);
  }

  public async getUserByGitlabUsername(gitlabUsername: string): Promise<User | undefined> {
    const rows = await db.client
      .table(tableName)
      .select<User[]>(allColumns)
      .where('gitlab_username', gitlabUsername)
      .limit(1);
    return rows?.[0];
  }

  public async getUserByTrelloMemberId(trelloMemberId: string): Promise<User | undefined> {
    const rows = await db.client
      .table(tableName)
      .select<User[]>(allColumns)
      .where('trello_member_id', trelloMemberId)
      .limit(1);
    return rows?.[0];
  }
}

export const userService = new UserService();
