import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import { getConfig } from "../config";

const commands = [
  new SlashCommandBuilder()
    .setName('wa-clear')
    .setDescription('Limpa as mensagens do canal de whatsapp'),
  new SlashCommandBuilder()
    .setName('voice-rank')
    .setDescription('Mostra o rank dos users do voice'),
  new SlashCommandBuilder()
    .setName('voice-points')
    .setDescription('Mostra os seus pontos no voice'),
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Menu de ajuda'),
  new SlashCommandBuilder()
    .setName('version')
    .setDescription('Versão do bot'),
];

export class Discord {
  public rest!: REST;
  public client!: Client;

  async initialize() {
    console.log('[Discord] Initializing');
    this.initializeCommands(); // Runs completelly on background
    await this.initializeClient();
    console.log('[Discord] Initialized');
  }

  private async initializeCommands() {
    const { discord: { token, clientId } } = getConfig();
    this.rest = new REST({ version: '10' }).setToken(token);
    try {
      console.log('[Discord] Started refreshing application (/) commands.');
      await this.rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('[Discord] Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('[Discord] Commands error:', error);
    }
  }

  private async initializeClient() {
    const { discord: { token } } = getConfig();

    this.client = new Client({ intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildScheduledEvents,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
    ] });

    this.client.on('ready', () => {
      console.log(`[Discord] Logged in as ${this.client.user?.tag}!`);
    });

    await this.client.login(token);
  }
}

export const discord = new Discord();
