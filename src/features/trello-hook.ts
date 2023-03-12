import { Interaction, TextChannel } from "discord.js";
import { discord } from "../clients/discord";
import { http } from "../controllers/http";
import { configService } from "../services/config";
import { handleExceptions } from "../utils/handle-exceptions";

export class TrelloHookFeature {
  async initialize() {
    console.log('[TrelloHookFeature] Initializing');

    http.app.post('/trello/hook', handleExceptions(async (req, res) => {
      console.log('[TrelloHookFeature] Hook call:', req.body);
      await this.send(req.body);
      res.status(200).send();
    }));

    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));

    console.log('[TrelloHookFeature] Initialized');
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    const ownerId = configService.get('discord.ownerId');
    if (interaction.user.id !== ownerId) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'trello-hook') return;

    switch (interaction.options.getSubcommand()) {
      case 'get-channel': {
        const channelId = configService.get('feature.trelloHook.channelId');
        if (channelId) {
          let channel: TextChannel | undefined = undefined;
          try {
            channel = await discord.client.channels.fetch(channelId) as TextChannel | undefined;
          } catch {}
          await interaction.reply(`O canal configurado é o ${channelId} (${channel?.name || '[Not found]'})`);
        } else {
          await interaction.reply('Nenhum canal está configurado');
        }
        break;
      }
      case 'set-channel': {
        configService.set('feature.trelloHook.channelId', interaction.channelId);
        await interaction.reply('Novo canal configurado');
        break;
      }
      case 'test': {
        this.send({});
        break;
      }
    }
  }

  private async send(message: any) {
    const channelId = configService.get('feature.trelloHook.channelId');
    if (!channelId) return;
    const channel = await discord.client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      const textChannel = channel as TextChannel;
      textChannel.send('Test');
    }
  }
}

export const trelloHookFeature = new TrelloHookFeature();
