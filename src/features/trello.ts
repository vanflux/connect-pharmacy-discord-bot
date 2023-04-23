import { EmbedBuilder, Interaction } from "discord.js";
import { discord } from "../clients/discord";
import { configService } from "../services/config";
import { trelloService } from "../services/trello";
import { handleExceptions } from "../utils/handle-exceptions";

export class TrelloFeature {
  async initialize() {
    console.log('[TrelloFeature] Initializing');
    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));
    console.log('[TrelloFeature] Initialized');
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    const ownerId = configService.get('discord.ownerId');
    if (interaction.user.id !== ownerId) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'trello') return;

    switch (interaction.options.getSubcommand()) {
      case 'get-board-ids': {
        const boardIds = await trelloService.getBoardIds();
        console.log('[TrelloFeature] Setting board ids to', boardIds);
        const embed = new EmbedBuilder();
        embed.setTitle('Ids de boards: ' + boardIds?.join(', '));
        embed.setColor('#3959DB');
        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'set-board-ids': {
        const boardIdsString = interaction.options.getString('board-ids');
        const boardIds = boardIdsString
          ?.split(',')
          .map(v => v.trim())
          .filter(Boolean)
          || [];
        await trelloService.setBoardIds(boardIds);
        console.log('[TrelloFeature] Setting board ids to', boardIds);
        const embed = new EmbedBuilder();
        embed.setTitle('Ids de boards setados para: ' + boardIds?.join(', '));
        embed.setColor('#3959DB');
        await interaction.reply({ embeds: [embed] });
        break;
      }
    }
  }
}

export const trelloFeature = new TrelloFeature();
