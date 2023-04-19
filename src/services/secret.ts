
export interface Secrets {
  database: {
    user: string;
    pass: string;
    host: string;
    port: number;
  },
  discord: {
    clientId: string;
    token: string;
  },
  trello: {
    apiKey: string;
    apiToken: string;
  },
  gitlab: {
    token: string;
  }
}

export class SecretService {
  private secrets!: Secrets;

  public async initialize() {
    console.log('[SecretService] Initializing');
    
    const databaseUser = process.env.DATABASE_USER;
    const databasePass = process.env.DATABASE_PASS;
    const databaseHost = process.env.DATABASE_HOST;
    const databasePort = this.int(process.env.DATABASE_PORT!);
    const discordBotClientId = process.env.DISCORD_BOT_CLIENT_ID;
    const discordBotToken = process.env.DISCORD_BOT_TOKEN;
    const trelloApiKey = process.env.TRELLO_API_KEY;
    const trelloApiToken = process.env.TRELLO_API_TOKEN;
    const gitlabToken = process.env.GITLAB_TOKEN;

    if (!databaseUser) throw new Error('DATABASE_USER must be provided!');
    if (!databasePass) throw new Error('DATABASE_PASS must be provided!');
    if (!databaseHost) throw new Error('DATABASE_HOST must be provided!');
    if (!databasePort) throw new Error('DATABASE_PORT must be provided!');
    if (!discordBotClientId) throw new Error('DISCORD_BOT_CLIENT_ID must be provided!');
    if (!discordBotToken) throw new Error('DISCORD_BOT_TOKEN must be provided!');
    if (!trelloApiKey) throw new Error('TRELLO_API_KEY must be provided!');
    if (!trelloApiToken) throw new Error('TRELLO_API_TOKEN must be provided!');
    if (!gitlabToken) throw new Error('GITLAB_TOKEN must be provided!');

    this.secrets = {
      database: {
        user: databaseUser!,
        pass: databasePass!,
        host: databaseHost!,
        port: databasePort!,
      },
      discord: {
        clientId: discordBotClientId!,
        token: discordBotToken!,
      },
      trello: {
        apiKey: trelloApiKey!,
        apiToken: trelloApiToken!
      },
      gitlab: {
        token: gitlabToken!
      }
    }

    console.log('[SecretService] Initialized');
  }

  private int(text: string) {
    return isNaN(Number(text)) ? undefined : Number(text);
  }

  getSecrets() {
    return this.secrets;
  }
}

export const secretService = new SecretService();
