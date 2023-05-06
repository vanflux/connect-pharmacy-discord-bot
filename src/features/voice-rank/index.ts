import { AttachmentBuilder, EmbedBuilder, Interaction, VoiceState } from "discord.js";
import { discord } from "../../clients/discord";
import { configService } from "../../services/config";
import { sprintService } from "../../services/sprint";
import { voiceActivityService } from "../../services/voice-activity";
import { calcPercentage } from "../../utils/calc-percentage";
import { handleExceptions } from "../../utils/handle-exceptions";
import { translateNumbersToEmojis } from "../../utils/translate-numbers-to-emojis";
import { generateVoiceRankStatsImage } from "./stats";

export class VoiceRankFeature {
  async initialize() {
    console.log('[VoiceRankFeature] Initializing');

    await this.handleAlreadyVoiceConnectedUsers();
    discord.client.on('voiceStateUpdate', handleExceptions((oldState, newState) => this.onVoiceStateUpdate(oldState, newState)));
    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));

    console.log('[VoiceRankFeature] Initialized');
  }

  private async handleAlreadyVoiceConnectedUsers() {
    const guildId = configService.get('discord.guildId');
    const openActivities = await voiceActivityService.getOpenActivities();
    const toClose = [...openActivities];
    if (guildId) {
      const guild = await discord.client.guilds.fetch(guildId);
      const channels = await guild.channels.fetch();
      await Promise.all(channels.map(async channel => {
        if (!channel?.isVoiceBased()) return;
        const channelId = channel.id;
        await channel?.members.map(async member => {
          const userId = member.id;
          const index = toClose.findIndex(activity => activity.channelId === channelId && activity.userId === userId);
          if (index >= 0) {
            // The user is on channel and has open activity, do nothing
            toClose.splice(index, 1);
          } else {
            // The user is on channel and don't have open activity, open one
            await voiceActivityService.openActivity(userId, channelId, new Date());
          }
        });
      }));
    }
    // The user is not on channel and have open activity, close it
    await Promise.all(
      toClose.map(activity => voiceActivityService.closeActivity(activity.id, activity.startTime))
    );
  }

  private async onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    const guildId = configService.get('discord.guildId');
    if (oldState.guild.id !== guildId) return;
    if (newState.guild.id !== guildId) return;
    if (oldState.id !== newState.id) return;
    if (oldState.channelId === newState.channelId) return;
    
    const userId = oldState.id;

    if (oldState.channelId) {
      const activity = await voiceActivityService.getOpenActivityOfUserOnChannel(userId, oldState.channelId);
      if (activity) {
        const date = new Date();
        console.log('[VoiceRankFeature] User', userId, 'exit channel', oldState.channelId, date);
        await voiceActivityService.closeActivity(activity.id, date);
      }
    }

    if (newState.channelId) {
      const date = new Date();
      console.log('[VoiceRankFeature] User', userId, 'enter channel', newState.channelId, date);
      await voiceActivityService.openActivity(userId, newState.channelId, date);
    }
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'voice') return;

    const guild = await discord.client.guilds.fetch(guildId);
    
    switch (interaction.options.getSubcommand()) {
      case 'rank': {
        let timeLabel = 'desde o início';
        const type = interaction.options.getString('time') || 'all';
        let startTime: Date | undefined = undefined;
        switch(type) {
          case 'week':
            startTime = new Date();
            startTime.setDate(startTime.getDate() - 7);
            timeLabel = 'da última semana';
            break;
          case 'month':
            startTime = new Date();
            startTime.setMonth(startTime.getMonth() - 1);
            timeLabel = 'do último mês';
            break;
        }
        const usersRank = await voiceActivityService.getUserRank(startTime);
        const allPoints = await voiceActivityService.getAllPoints(startTime) || 0;
        console.log('[VoiceRankFeature] Voice users rank:', usersRank);
        const embed = new EmbedBuilder();
        embed.setTitle(`Rank do Voice ${timeLabel} :loud_sound:`);
        embed.setDescription('cof cof farm :farmer:');
        embed.setColor('#3959DB');
        for (let i = 0; i < usersRank.length; i++) {
          const { userId, total } = usersRank[i];
          let member;
          try {
            member = await guild.members.fetch(userId);
          } catch {}
          const name = `${i+1}º ${member?.displayName || 'unknown'}${[' 🥇', ' 🥈', ' 🥉'][i] || ''}`
          const percentage = calcPercentage(total, allPoints);
          const value = `${translateNumbersToEmojis(total)}  Pontos (${percentage}% do total)`;
          embed.addFields({
            name,
            value,
            inline: false
          });
        }
        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'points': {
        const points = await voiceActivityService.getUserPoints(interaction.user.id) || 0;
        const allPoints = await voiceActivityService.getAllPoints() || 0;
        console.log('[VoiceRankFeature] Voice user points of', interaction.user.id, ':', points);
        const embed = new EmbedBuilder();
        embed.setTitle('Seus Pontos do Voice :loud_sound:');
        embed.setColor('#3959DB');
        const member = await guild.members.fetch(interaction.user.id);
        const name = member.displayName;
        const percentage = calcPercentage(points, allPoints);
        const value = `${translateNumbersToEmojis(points)} Pontos (${percentage}% do total)`;
        embed.addFields({
          name,
          value,
          inline: false
        });
        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'stats': {
        const sprintNum = interaction.options.getNumber('sprint');
        if (sprintNum == null) return;
        const sprint = await sprintService.getSprintByNum(sprintNum);
        if (!sprint) return;
        const buffer = await generateVoiceRankStatsImage(sprint);
        const embed = new EmbedBuilder();
        embed.setTitle(`Stats do Voice (Sprint ${sprintNum}) :loud_sound:`);
        embed.setColor('#3959DB');
        const fileName = `Voice_Stats.png`;
        const attachment = new AttachmentBuilder(buffer, { name: fileName });
        embed.setImage(`attachment://${fileName}`);
        interaction.reply({ embeds: [embed], files: [ attachment ] });
      }
    }
  }
}

export const voiceRankFeature = new VoiceRankFeature();
