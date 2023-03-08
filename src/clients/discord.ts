import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import { getConfig } from "../config";

const commands = [
  new SlashCommandBuilder()
    .setName('wa-clear')
    .setDescription('Clear whatsapp bridge messages')
];

export class Discord {
  public rest!: REST;
  public client!: Client;

  async initialize() {
    console.log('[Discord] Initializing');
    await this.initializeClient();
    this.initializeCommands(); // Runs completelly on background
    console.log('[Discord] Initialized');
  }

  private async initializeCommands() {
    const { token, clientId } = getConfig();
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
    const { token } = getConfig();

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
