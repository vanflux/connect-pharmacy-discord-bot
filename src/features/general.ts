import { EmbedBuilder, Interaction, SlashCommandSubcommandBuilder, TextChannel } from "discord.js";
import { getVersionChangeLog } from "../changelog";
import { discord } from "../clients/discord";
import { whatsapp } from "../clients/whatsapp";
import { configService } from "../services/config";
import { handleExceptions } from "../utils/handle-exceptions";

export class GeneralFeature {
  async initialize() {
    console.log('[GeneralFeature] Initializing');

    await this.informVersionChange();
    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));

    console.log('[GeneralFeature] Initialized');
  }

  private async informVersionChange() {
    const version = configService.get('version');
    const currentVersion = process.env.VERSION;
    if (!currentVersion?.length || version === currentVersion) return;
    await configService.set('version', currentVersion);
    console.log('[GeneralFeature] Bot version has changed from', version, 'to', currentVersion);
    const channelId = configService.get('log.channelId');
    if (!channelId) return;
    try {
      const channel = await discord.client.channels.fetch(channelId) as TextChannel | undefined;
      if (!channel) return;

      let description = `Bot atualizado para a versão ${currentVersion || 'dev'} 🥳\n\n`;
      const changeLog = getVersionChangeLog(currentVersion);
      for (const line of changeLog) description += `- ${line}\n`;

      const embed = new EmbedBuilder();
      embed.setTitle('Update do bot');
      embed.setColor('#3959DB');
      embed.setDescription(description);

      await channel.send({ embeds: [embed], flags: 4096 });
    } catch (error) {
      console.log('[GeneralFeature] Failed to inform version:', error);
    }
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
      case 'help': {
        const embed = new EmbedBuilder();
        embed.setTitle('Menu de ajuda');
        embed.setColor('#3959DB');
        discord.getCommands().forEach(command => {
          embed.addFields({
            name: `/${command.name}`,
            value: command.description,
            inline: false
          });
          command.options.forEach(option => {
            if (option instanceof SlashCommandSubcommandBuilder) {
              const subCommand= option;
              const options = subCommand.options
              .filter(option => option?.name)
              .map(option => `<${option.name}>`);
              embed.addFields({
                name: `/${command.name} ${subCommand.name} ${options.join(' ')}`,
                value: subCommand.description,
                inline: false
              });
            }
          })
        });
        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'version': {
        const version = configService.get('version');
        const embed = new EmbedBuilder();
        embed.setTitle('Versão do bot');
        embed.setColor('#3959DB');
        embed.setDescription(`${version || 'Dev (ops, quem foi o otário que esqueceu de tirar isso)'}`);
        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'wa': {
        const ownerId = configService.get('discord.ownerId');
        if (interaction.user.id !== ownerId) return;
        switch (interaction.options.getSubcommand()) {
          case 'get-socket': {
            const socket = configService.get('whatsapp.socket');
            if (socket) {
              await interaction.reply(`O socket configurado é o ${socket})`);
            } else {
              await interaction.reply('Nenhum socket está configurado');
            }
            break;
          }
          case 'set-socket': {
            const socket = interaction.options.get('socket')?.value;
            if (typeof socket === 'string') {
              configService.set('whatsapp.socket', socket);
              await interaction.reply('Novo socket configurado');
            } else {
              await interaction.reply('Socket inválido');
            }
            break;
          }
          case 'reload': {
            await interaction.reply('Recarregando...');
            const start = Date.now();
            const success = await whatsapp.reload();
            const end = Date.now();
            const duration = end - start;
            if (success) {
              await interaction.editReply(`Recarregado com sucesso, ${duration}ms`);
            } else {
              await interaction.editReply(`Não foi possível estabelecer um conexão com o socket, ${duration}ms`);
            }
            break;
          }
          case 'status': {
            const status = whatsapp.connecting ? 'Conectando' : (whatsapp.connected ? 'Conectado' : 'Desconectado');
            await interaction.reply(`Status da conexão: ${status}`);
            break;
          }
        }
      }
      case 'log': {
        const ownerId = configService.get('discord.ownerId');
        if (interaction.user.id !== ownerId) return;
        switch (interaction.options.getSubcommand()) {
          case 'get-channel': {
            const channelId = configService.get('log.channelId');
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
            configService.set('log.channelId', interaction.channelId);
            await interaction.reply('Novo canal configurado');
            break;
          }
        }
      }
    }
  }
}

export const generalFeature = new GeneralFeature();
