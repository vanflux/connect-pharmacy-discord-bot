import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import { secretService } from "../services/secret";

const commands = [
  new SlashCommandBuilder()
    .setName('wa')
    .setDescription('Comandos do whatsapp')
    .addSubcommand(command => command
      .setName('get-socket')
      .setDescription('Mostra o socket do server do whatsapp')
    )
    .addSubcommand(command => command
      .setName('set-socket')
      .setDescription('Seta o socket do server do whatsapp')
      .addStringOption(option => option.setRequired(true).setName('socket').setDescription('Socket do server do whatsapp')),
    )
    .addSubcommand(command => command
      .setName('reload')
      .setDescription('Recarrega a conexão com o socket')
    )
    .addSubcommand(command => command
      .setName('status')
      .setDescription('Status da conexão com o socket')
    ),
  new SlashCommandBuilder()
    .setName('wa-bridge')
    .setDescription('Comandos do espelhamento de whatsapp')
    .addSubcommand(command => command
      .setName('get-channel')
      .setDescription('Mostra o canal que está espelhando as mensagens')
    )
    .addSubcommand(command => command
      .setName('set-channel')
      .setDescription('Seta o canal para espelhar as mensagens')
    )
    .addSubcommand(command => command
      .setName('get-chat-id')
      .setDescription('Mostra o chat que está espelhando as mensagens')
    )
    .addSubcommand(command => command
      .setName('set-chat-id')
      .setDescription('Seta o chat para espelhar as mensagens')
      .addStringOption(option => option.setRequired(true).setName('chat-id').setDescription('Id do chat do whatsapp')),
    ),
  new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Comandos dos pontos do voice')
    .addSubcommand(command => command
      .setName('rank')
      .setDescription('Mostra o rank dos users do voice')
    )
    .addSubcommand(command => command
      .setName('points')
      .setDescription('Mostra os seus pontos no voice')
    ),
  new SlashCommandBuilder()
    .setName('gitlab-hook')
    .setDescription('Comandos do hook do gitlab')
    .addSubcommand(command => command
      .setName('get-channel')
      .setDescription('Mostra o canal que está recebendo notificações do gitlab')
    )
    .addSubcommand(command => command
      .setName('set-channel')
      .setDescription('Seta o canal para receber notificações do gitlab')
    )
    .addSubcommand(command => command
      .setName('test')
      .setDescription('Testa o hook')
    ),
  new SlashCommandBuilder()
    .setName('log')
    .setDescription('Comandos de log do bot')
    .addSubcommand(command => command
      .setName('get-channel')
      .setDescription('Mostra o canal de log')
    )
    .addSubcommand(command => command
      .setName('set-channel')
      .setDescription('Seta o canal de log')
    ),
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Não use isso'),
  new SlashCommandBuilder()
    .setName('version')
    .setDescription('Explode o server'),
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
    const { discord: { token, clientId } } = secretService.getSecrets();
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
    const { discord: { token } } = secretService.getSecrets();

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

  public getCommands() {
    return commands;
  }
}

export const discord = new Discord();
