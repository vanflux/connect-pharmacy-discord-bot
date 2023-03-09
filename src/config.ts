
const int = (text: string) => isNaN(Number(text)) ? undefined : Number(text);

const databaseUser = process.env.DATABASE_USER;
const databasePass = process.env.DATABASE_PASS;
const databaseHost = process.env.DATABASE_HOST;
const databasePort = int(process.env.DATABASE_PORT!);
if (!databaseUser) throw new Error('DATABASE_USER must be provided!');
if (!databasePass) throw new Error('DATABASE_PASS must be provided!');
if (!databaseHost) throw new Error('DATABASE_HOST must be provided!');
if (!databasePort) throw new Error('DATABASE_PORT must be provided!');

const discordBotClientId = process.env.DISCORD_BOT_CLIENT_ID;
const discordBotToken = process.env.DISCORD_BOT_TOKEN;
const discordOwnerId = process.env.DISCORD_OWNER_ID;
const discordGuildId = process.env.DISCORD_GUILD_ID;
if (!discordBotClientId) throw new Error('DISCORD_BOT_CLIENT_ID must be provided!');
if (!discordBotToken) throw new Error('DISCORD_BOT_TOKEN must be provided!');
if (!discordOwnerId) throw new Error('DISCORD_OWNER_ID must be provided!');
if (!discordGuildId) throw new Error('DISCORD_GUILD_ID must be provided!');

const featureW2dBridgeChannelId = process.env.FEATURE_W2D_BRIDGE_CHANNEL_ID;
const featureW2dBridgeWaChatId = process.env.FEATURE_W2D_BRIDGE_WA_CHAT_ID;
if (!featureW2dBridgeChannelId) throw new Error('FEATURE_W2D_BRIDGE_CHANNEL_ID must be provided!');
if (!featureW2dBridgeWaChatId) throw new Error('FEATURE_W2D_BRIDGE_WA_CHAT_ID must be provided!');

const whatsappSocket = process.env.WHATSAPP_SOCKET || 'http://localhost:8080';
const whatsappOptional = process.env.WHATSAPP_OPTIONAL?.toLowerCase() === 'true';

export function getConfig() {
  return {
    database: {
      user: databaseUser!,
      pass: databasePass!,
      host: databaseHost!,
      port: databasePort!,
    },
    whatsapp: {
      socket: whatsappSocket!,
      optional: whatsappOptional!,
    },
    discord: {
      clientId: discordBotClientId!,
      token: discordBotToken!,
      ownerId: discordOwnerId!,
      guildId: discordGuildId!,
    },
    feature: {
      w2dBridge: {
        channelId: featureW2dBridgeChannelId!,
        waChatId: featureW2dBridgeWaChatId!,
      },
    },
  };
}
