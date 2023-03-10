import { EmbedBuilder } from "discord.js";
import { discord } from "../clients/discord";
import { getConfig } from "../config";
import { handleExceptions } from "../utils/handle-exceptions";

export class HelpFeature {
  async initialize() {
    console.log('[HelpFeature] Initializing');
    const { version, discord: { guildId } } = getConfig();
    
    discord.client.on('interactionCreate', handleExceptions(async interaction => {
      if (interaction.guildId !== guildId) return;
      if (!interaction.isCommand()) return;
      switch (interaction.commandName) {
        case 'help': {
          const embed = new EmbedBuilder();
          embed.setTitle('Menu de ajuda');
          embed.setColor('#3959DB');
          embed.addFields({
            name: '/voice-rank',
            value: 'Rank de usuários do voice',
            inline: false
          });
          embed.addFields({
            name: '/voice-points',
            value: 'Seus pontos do voice',
            inline: false
          });
          embed.addFields({
            name: '/version',
            value: 'Explode o server',
            inline: false
          });
          embed.addFields({
            name: '/help',
            value: 'Não use isso',
            inline: false
          });
          await interaction.reply({ embeds: [embed] });
          break;
        }
        case 'version': {
          const embed = new EmbedBuilder();
          embed.setTitle('Versão do bot');
          embed.setColor('#3959DB');
          embed.setDescription(`${version || 'Dev (ops, quem foi o otário que esqueceu de tirar isso)'}`);
          await interaction.reply({ embeds: [embed] });
          break;
        }
      }
    }));

    console.log('[HelpFeature] Initialized');
  }
}

export const helpFeature = new HelpFeature();
