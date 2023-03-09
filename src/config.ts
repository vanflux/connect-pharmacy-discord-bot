
const discordBotClientId = process.env.DISCORD_BOT_CLIENT_ID;
const discordBotToken = process.env.DISCORD_BOT_TOKEN;
const discordOwnerId = process.env.DISCORD_OWNER_ID;
if (!discordBotClientId) throw new Error('DISCORD_BOT_CLIENT_ID must be provided!');
if (!discordBotToken) throw new Error('DISCORD_BOT_TOKEN must be provided!');
if (!discordOwnerId) throw new Error('DISCORD_OWNER_ID must be provided!')

const featureW2dBridgeChannelId = process.env.FEATURE_W2D_BRIDGE_CHANNEL_ID;
const featureW2dBridgeWaChatId = process.env.FEATURE_W2D_BRIDGE_WA_CHAT_ID;
if (!featureW2dBridgeChannelId) throw new Error('FEATURE_W2D_BRIDGE_CHANNEL_ID must be provided!');
if (!featureW2dBridgeWaChatId) throw new Error('FEATURE_W2D_BRIDGE_WA_CHAT_ID must be provided!');

const whatsappSocket = process.env.WHATSAPP_SOCKET || 'http://localhost:8080';

export function getConfig() {
  return {
    whatsapp: {
      socket: whatsappSocket!,
    },
    discord: {
      clientId: discordBotClientId!,
      token: discordBotToken!,
      ownerId: discordOwnerId!,
    },
    feature: {
      w2dBridge: {
        channelId: featureW2dBridgeChannelId!,
        waChatId: featureW2dBridgeWaChatId!,
      },
    },
  };
}
