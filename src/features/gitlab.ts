import { EmbedBuilder, Interaction } from "discord.js";
import { discord } from "../clients/discord";
import { configService } from "../services/config";
import { gitlabService } from "../services/gitlab";
import { handleExceptions } from "../utils/handle-exceptions";

export class GitlabFeature {
  async initialize() {
    console.log('[GitlabFeature] Initializing');
    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));
    console.log('[GitlabFeature] Initialized');
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    const ownerId = configService.get('discord.ownerId');
    if (interaction.user.id !== ownerId) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'gitlab') return;

    switch (interaction.options.getSubcommand()) {
      case 'get-project-ids': {
        const projectIds = await gitlabService.getProjectIds();
        console.log('[GitlabFeature] Setting project ids to', projectIds);
        const embed = new EmbedBuilder();
        embed.setTitle('Ids de projetos: ' + projectIds?.join(', '));
        embed.setColor('#3959DB');
        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'set-project-ids': {
        const projectIdsString = interaction.options.getString('project-ids');
        const projectIds = projectIdsString
          ?.split(',')
          .map(v => parseInt(v))
          .filter(v => !isNaN(v))
          || [];
        await gitlabService.setProjectIds(projectIds);
        console.log('[GitlabFeature] Setting project ids to', projectIds);
        const embed = new EmbedBuilder();
        embed.setTitle('Ids de projetos setados para: ' + projectIds?.join(', '));
        embed.setColor('#3959DB');
        await interaction.reply({ embeds: [embed] });
        break;
      }
    }
  }
}

export const gitlabFeature = new GitlabFeature();
