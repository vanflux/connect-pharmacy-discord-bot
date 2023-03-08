

const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;
const waChatId = process.env.WA_CHAT_ID;
const discordWaDcBridgeId = process.env.DISCORD_WA_DC_BRIDGE_ID;
const waSocket = process.env.WA_SOCKET || 'http://localhost:8080';
const ownerId = process.env.OWNER_ID;

if (!clientId) throw new Error('CLIENT_ID must be provided!');
if (!token) throw new Error('DISCORD_TOKEN must be provided!');
if (!waChatId) throw new Error('WA_CHAT_ID must be provided!');
if (!discordWaDcBridgeId) throw new Error('DISCORD_WA_DC_BRIDGE_ID must be provided!');
if (!ownerId) throw new Error('OWNER_ID must be provided!');

export function getConfig() {
  return {
    waChatId: waChatId!,
    clientId: clientId!,
    token: token!,
    discordWaDcBridgeId: discordWaDcBridgeId!,
    ownerId: ownerId!,
    waSocket: waSocket!,
  };
}
