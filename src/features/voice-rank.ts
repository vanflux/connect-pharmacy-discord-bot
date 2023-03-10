import { EmbedBuilder } from "discord.js";
import { discord } from "../clients/discord";
import { getConfig } from "../config";
import { voiceRankService } from "../services/voice-rank-service";
import { handleExceptions } from "../utils/handle-exceptions";

export class VoiceRankFeature {
  async initialize() {
    console.log('[VoiceRankFeature] Initializing');
    const { discord: { guildId } } = getConfig();
    
    const guild = await discord.client.guilds.fetch(guildId);
    const channels = await guild.channels.fetch();
    const openActivities = await voiceRankService.getOpenActivities();
    const toClose = [...openActivities];
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
          await voiceRankService.openActivity(userId, channelId, new Date());
        }
      });
    }));
    // The user is not on channel and have open activity, close it
    await Promise.all(
      toClose.map(activity => voiceRankService.closeActivity(activity.id, activity.startTime))
    );

    discord.client.on('voiceStateUpdate', handleExceptions(async (oldState, newState) => {
      if (oldState.guild.id !== guildId) return;
      if (newState.guild.id !== guildId) return;
      if (oldState.id !== newState.id) return;
      if (oldState.channelId === newState.channelId) return;
      
      const userId = oldState.id;

      if (oldState.channelId) {
        const activity = await voiceRankService.getOpenActivityOfUserOnChannel(userId, oldState.channelId);
        if (activity) {
          const date = new Date();
          console.log('[VoiceRankFeature] User', userId, 'exit channel', oldState.channelId, date);
          await voiceRankService.closeActivity(activity.id, date);
        }
      }

      if (newState.channelId) {
        const date = new Date();
        console.log('[VoiceRankFeature] User', userId, 'enter channel', newState.channelId, date);
        await voiceRankService.openActivity(userId, newState.channelId, date);
      }
    }));

    discord.client.on('interactionCreate', handleExceptions(async interaction => {
      if (interaction.guildId !== guildId) return;
      if (!interaction.isCommand()) return;
      switch (interaction.commandName) {
        case 'voice-rank': {
          const usersRank = await voiceRankService.getUserRank();
          const allPoints = await voiceRankService.getAllPoints() || 0;
          console.log('[VoiceRankFeature] Voice users rank:', usersRank);
          const embed = new EmbedBuilder();
          embed.setTitle('Rank do Voice :loud_sound:');
          embed.setDescription('cof cof farm :farmer:');
          embed.setColor('#3959DB');
          await Promise.all(usersRank.map(async ({ userId, total }, i) => {
            const member = await guild.members.fetch(userId);
            const name = `${i+1}º ${member.displayName}${[' 🥇', ' 🥈', ' 🥉'][i] || ''}`
            const percentage = this.calcPercentage(total, allPoints);
            const value = `${this.translateNumbersToEmojis(total)}  Pontos (${percentage}% do total)`;
            embed.addFields({
              name,
              value,
              inline: false
            });
          }));
          await interaction.reply({ embeds: [embed] });
          break;
        }
        case 'voice-points': {
          const points = await voiceRankService.getUserPoints(interaction.user.id) || 0;
          const allPoints = await voiceRankService.getAllPoints() || 0;
          console.log('[VoiceRankFeature] Voice user points of', interaction.user.id, ':', points);
          const embed = new EmbedBuilder();
          embed.setTitle('Seus Pontos do Voice :loud_sound:');
          embed.setColor('#3959DB');
          const member = await guild.members.fetch(interaction.user.id);
          const name = member.displayName;
          const percentage = this.calcPercentage(points, allPoints);
          const value = `${this.translateNumbersToEmojis(points)} Pontos (${percentage}% do total)`;
          embed.addFields({
            name,
            value,
            inline: false
          });
          await interaction.reply({ embeds: [embed] });
          break;
        }
      }
    }));

    console.log('[VoiceRankFeature] Initialized');
  }

  private calcPercentage(value: number, max: number) {
    if (value > max) value = max;
    const percentage = max === 0 ? 0 : (Math.floor(value / max * 1000) / 10);
    return percentage;
  }

  private translateNumbersToEmojis(num: number) {
    return String(num).split('').map(char => [
      ':zero:', ':one:', ':two:', ':three:', ':four:',
      ':five:', ':six:', ':seven:', ':eight:', ':nine:'
    ][char.charCodeAt(0) - '0'.charCodeAt(0)] || '').join('');
  }
}

export const voiceRankFeature = new VoiceRankFeature();
