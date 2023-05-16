import { EmbedBuilder, Interaction, TextChannel } from "discord.js";
import { discord } from "../clients/discord";
import { configService } from "../services/config";
import { gitlabService } from "../services/gitlab";
import { userService } from "../services/user";
import { daysHoursDiff } from "../utils/date";
import { handleExceptions } from "../utils/handle-exceptions";

export class MrStatsFeature {
  async initialize() {
    console.log('[MrStatsFeature] Initializing');
    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));

    console.log('[MrStatsFeature] Initialized');
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'mr-stats') return;

    try {
      const projectIds = await gitlabService.getProjectIds();
      const mrsStats = await Promise.all(projectIds.map(async projectId => {
        const project = await gitlabService.getProjectById(projectId);
        const mrs = await gitlabService.getOpenMrsByProjectId(projectId);
        if (!project) throw new Error('Cannot get project ' + projectId);
        if (!mrs) throw new Error('Cannot get merge requests of ' + projectId);
        return {
          projectName: project.name,
          mergeRequests: await Promise.all(mrs
            .filter(mr => !mr.draft && !mr.work_in_progress && !mr.title.match(/\bwip\b/i))
            .map(async mr => {
              const user = await userService.getUserByGitlabUsername(mr.author.username)
              return {
                user,
                createdAt: new Date(mr.created_at),
                authorName: mr.author.name,
                hasConflicts: mr.has_conflicts,
                blockingDiscussionResolved: mr.blocking_discussions_resolved,
                sourceBranch: mr.source_branch,
                targetBranch: mr.target_branch,
                title: mr.title,
                url: mr.web_url,
              }
            })
          )
        };
      }));
      console.log('[MrStatsFeature] Stats of merge requests', mrsStats);
      await interaction.reply('Status dos merge requests:');

      const channel = interaction.channel as TextChannel;
      const now = new Date();
      for (const mrStats of mrsStats) {
        const embed = new EmbedBuilder();
        embed.setTitle(`Merge requests de **${mrStats.projectName}**:`);
        embed.setColor('#3959DB');
        let description = '';
        for (const mr of mrStats.mergeRequests) {
          const diff = daysHoursDiff(mr.createdAt, now);
          const diffText = diff.days < 1 ? `${Math.floor(diff.hours)} hora${diff.hours > 2 ? 's' : ''}` : `${Math.floor(diff.days)} dia${diff.days > 2 ? 's' : ''}`;
          const userMention = mr.user?.discordUserId ? `<@${mr.user.discordUserId}>` : mr.authorName;
          const canReview = !mr.hasConflicts && mr.blockingDiscussionResolved;
          description += `> **[Merge request](${mr.url})** (**Há ${diffText}**) ${canReview ? '⭐ Ages III e IV Revisem! ⭐' : `⛈ Arrume o MR ${userMention} ⛈`}\n`;
          description += `**${mr.title}**\n`;
          description += `${mr.sourceBranch} -> ${mr.targetBranch} (${userMention})\n`;
          if (mr.hasConflicts) description += `❌ Tem conflitos para resolver! ❌\n`;
          if (!mr.blockingDiscussionResolved) description += `❌ Tem comentários para resolver! ❌\n`;
          description += `\n`;
        }
        if (description.length > 0) {
          embed.setDescription(description);
          await channel.send({ embeds: [embed] });
        }
      }
    } catch (exc) {
      console.error('[MrStatsFeature] Failed to get stats:', exc);
      const embed = new EmbedBuilder();
      embed.setTitle('Falha ao obter status de merge requests, quem é o culpado?');
      embed.setColor('#FF0000');
      await interaction.reply({ embeds: [embed] });
    }
  }
}

export const mrStatsFeature = new MrStatsFeature();
