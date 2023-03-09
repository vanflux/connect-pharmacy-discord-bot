import { EmbedBuilder } from "discord.js";
import { discord } from "../clients/discord";
import { getConfig } from "../config";
import { voiceRankService } from "../services/voice-rank-service";

export class VoiceRankFeature {
  async initialize() {
    console.log('[VoiceRankFeature] Initializing');
    const { discord: { ownerId, guildId } } = getConfig();
    
    const guild = await discord.client.guilds.fetch(guildId);
    const channels = await guild.channels.fetch();
    console.log('channels', channels.filter(channel => channel?.isVoiceBased()).size);

    discord.client.on('voiceStateUpdate', async (oldState, newState) => {
      if (oldState.guild.id !== guildId) return;
      if (newState.guild.id !== guildId) return;
      if (oldState.id !== newState.id) return;
      if (oldState.channelId === newState.channelId) return;
      
      const userId = oldState.id;

      if (oldState.channelId) {
        const voiceActivity = await voiceRankService.getNotEndedActivityOfUserOnChannel(userId, oldState.channelId);
        if (voiceActivity) {
          const date = new Date();
          console.log('[VoiceRankFeature] User', userId, 'exit channel', oldState.channelId, date);
          await voiceRankService.endActivity(voiceActivity.id, date);
        }
      }

      if (newState.channelId) {
        const date = new Date();
        console.log('[VoiceRankFeature] User', userId, 'enter channel', newState.channelId, date);
        await voiceRankService.startActivity(userId, newState.channelId, date);
      }
    });

    discord.client.on('interactionCreate', async interaction => {
      if (interaction.user.id !== ownerId) return;
      if (!interaction.isCommand()) return;
      switch (interaction.commandName) {
        case 'voice-rank':
          const usersRank = await voiceRankService.getUserRank();
          console.log('[VoiceRankFeature] Voice users rank:', usersRank);
          const embed = new EmbedBuilder();
          embed.setTitle('Rank do Voice :loud_sound:');
          embed.setColor('#3959DB');
          await Promise.all(usersRank.map(async ({ userId, total }, i) => {
            const member = await guild.members.fetch(userId);
            const name = `${i+1}º ${member.displayName}${[' 🥇', ' 🥈', ' 🥉'][i] || ''}`
            const value = `${String(total).split('').map(char => [
              ':zero:', ':one:', ':two:', ':three:', ':four:',
              ':five:', ':six:', ':seven:', ':eight:', ':nine:'
            ][char.charCodeAt(0) - '0'.charCodeAt(0)] || '').join('')}  Pontos`;
            embed.addFields({
              name,
              value,
              inline: false
            });
          }));
          await interaction.reply({ embeds: [embed] });
          break;
      }
    });

    console.log('[VoiceRankFeature] Initialized');
  }
}

export const voiceRankFeature = new VoiceRankFeature();
