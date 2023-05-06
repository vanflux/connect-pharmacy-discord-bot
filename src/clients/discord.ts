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
      .addStringOption(option => option
        .setRequired(false)
        .setChoices(
          { name: 'Mês', value: 'month' },
          { name: 'Semana', value: 'week' },
          { name: 'Tudo', value: 'all' }
        )
        .setName('time')
        .setDescription('Tempo')
      )
    )
    .addSubcommand(command => command
      .setName('points')
      .setDescription('Mostra os seus pontos no voice')
    )
    .addSubcommand(command => command
      .setName('stats')
      .setDescription('Mostra o status do voice para a sprint')
      .addNumberOption(option => option
        .setRequired(true)
        .setName('sprint')
        .setDescription('Número da sprint')
      )
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
    .setName('trello-hook')
    .setDescription('Comandos do hook do trello')
    .addSubcommand(command => command
      .setName('get-channel')
      .setDescription('Mostra o canal que está recebendo notificações do trello')
    )
    .addSubcommand(command => command
      .setName('set-channel')
      .setDescription('Seta o canal para receber notificações do trello')
    )
    .addSubcommand(command => command
      .setName('test')
      .setDescription('Testa o hook')
    ),
  new SlashCommandBuilder()
    .setName('gitlab')
    .setDescription('Comandos do gitlab')
    .addSubcommand(command => command
      .setName('get-project-ids')
      .setDescription('Mostra os ids dos projetos do gitlab')
    )
    .addSubcommand(command => command
      .setName('set-project-ids')
      .setDescription('Seta os ids dos projetos do gitlab')
      .addStringOption(option => option.setRequired(true).setName('project-ids').setDescription('Ids dos projetos do gitlab')),
    ),
  new SlashCommandBuilder()
    .setName('trello')
    .setDescription('Comandos do trello')
    .addSubcommand(command => command
      .setName('get-board-ids')
      .setDescription('Mostra os ids das boards do trello')
    )
    .addSubcommand(command => command
      .setName('set-board-ids')
      .setDescription('Seta os ids das boards do trello')
      .addStringOption(option => option.setRequired(true).setName('board-ids').setDescription('Ids das boards do trello')),
    ),
  new SlashCommandBuilder()
    .setName('mr-stats')
    .setDescription('Status dos merge requests'),
  new SlashCommandBuilder()
    .setName('task-stats')
    .setDescription('Status das tasks'),
  new SlashCommandBuilder()
    .setName('user')
    .setDescription('Comandos de usuário')
    .addSubcommand(command => command
      .setName('add')
      .setDescription('Adiciona um usuário')
      .addStringOption(option => option.setRequired(true).setName('name').setDescription('Nome do usuário'))
      .addNumberOption(option => option.setRequired(true).setName('ages-level').setDescription('Nível da Ages do usuário')),
    )
    .addSubcommand(command => command
      .setName('delete')
      .setDescription('Deleta um usuário')
      .addNumberOption(option => option.setRequired(true).setName('id').setDescription('Id do usuário'))
    )
    .addSubcommand(command => command
      .setName('list')
      .setDescription('Lista os usuários')
    )
    .addSubcommand(command => command
      .setName('edit')
      .setDescription('Edita um usuário')
      .addNumberOption(option => option.setRequired(true).setName('id').setDescription('Id do usuário'))
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
