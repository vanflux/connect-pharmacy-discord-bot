import { Chat, ContactId, Message, MessageTypes } from "@open-wa/wa-automate";
import { AttachmentBuilder, EmbedBuilder, Interaction, TextChannel } from "discord.js";
import { discord } from "../clients/discord";
import { whatsapp } from "../clients/whatsapp";
import { extension } from "mime-types";
import { handleExceptions } from "../utils/handle-exceptions";
import { configService } from "../services/config";

const tearsEmoji = () => ':smiling_face_with_tear:';
const messageWithXSeeWhatsapp = (x: string) => `Mensagem com ${x} ${tearsEmoji()}, olhe o whatsapp`;
const messageFileTooBig = () => `Mensagem com arquivo muito grande ${tearsEmoji()}, olhe o whatsapp`;

export class WaBridgeFeature {
  async initialize() {
    console.log('[WaBridgeFeature] Initializing');
    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));
    whatsapp.on('message', handleExceptions(message => this.onMessage(message)));
    console.log('[WaBridgeFeature] Initialized');
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    const ownerId = configService.get('discord.ownerId');
    if (interaction.user.id !== ownerId) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'wa-bridge') return;

    switch (interaction.options.getSubcommand()) {
      case 'get-channel': {
        const channelId = configService.get('feature.w2dBridge.channelId');
        if (channelId) {
          const channel = await discord.client.channels.fetch(channelId) as TextChannel | undefined;
          await interaction.reply(`O canal configurado é o ${channelId} (${channel?.name || '[Not found]'})`);
        } else {
          await interaction.reply('Nenhum canal está configurado');
        }
        break;
      }
      case 'set-channel': {
        configService.set('feature.w2dBridge.channelId', interaction.channelId);
        await interaction.reply('Novo canal configurado');
        break;
      }
      case 'get-chat-id': {
        const chatId = configService.get('feature.w2dBridge.waChatId');
        if (chatId) {
          let chat: Chat | undefined = undefined;
          try {
            chat = await whatsapp.client.getChatById(chatId as ContactId);
          } catch {}
          await interaction.reply(`O chat configurado é o ${chatId} (${chat?.name || '[Not found]'})`);
        } else {
          await interaction.reply('Nenhum chat está configurado');
        }
        break;
      }
      case 'set-chat-id': {
        const chatId = interaction.options.get('chat-id')?.value;
        if (typeof chatId === 'string' && chatId.includes('@') && chatId.length >= 3) {
          configService.set('feature.w2dBridge.waChatId', chatId);
          await interaction.reply('Novo canal configurado');
        } else {
          await interaction.reply('Id de chat inválido');
        }
        break;
      }
    }
  }

  private async onMessage(message: Message) {
    const waChatId = configService.get('feature.w2dBridge.waChatId');
    if (message.chatId !== waChatId) return;
    if (!message.isGroupMsg) return;

    const channelId = configService.get('feature.w2dBridge.channelId');
    if (!channelId) return;
    const channel = await discord.client.channels.fetch(channelId);
    const textChannel = channel as TextChannel;

    const senderName = message.sender.pushname || 'Unknown';
    const profilePictureUrl = message.sender.profilePicThumbObj?.img;

    const fileFormat = message.mimetype && message.mimetype.includes('/') ? message.mimetype.split('/')[1].split(';')[0] : undefined;
    const fileExtension = message.mimetype ? extension(message.mimetype) : undefined;
    const hasFile = message.mimetype && fileFormat;
    const fileDataUrlBase64 = hasFile ? await whatsapp.client.decryptMedia(message.id) : undefined;
    const fileDataUrlBase64Index = hasFile ? fileDataUrlBase64!.indexOf(';base64,') + 8 : undefined;
    const fileBuffer = hasFile ? Buffer.from(fileDataUrlBase64!.substring(fileDataUrlBase64Index!), 'base64') : undefined;
    const fileSize = hasFile ? (fileBuffer ? fileBuffer.length : 0) : undefined;
    const fileIsOverLimit = hasFile ? fileSize! > 8 * 1000 * 1000 : false;

    const embed = new EmbedBuilder();
    embed.setAuthor({ iconURL: profilePictureUrl, name: senderName });
    embed.setColor('#5BD457');
    embed.setDescription(message.text || ' ');

    switch (message.type) {
      case MessageTypes.TEXT: {
        textChannel.send({ embeds: [ embed ] });
        break;
      }
      case MessageTypes.AUDIO: {
        embed.addFields({ name: 'Info', value: messageWithXSeeWhatsapp('áudio') });
        textChannel.send({ embeds: [ embed ] });
        break;
      }
      case MessageTypes.DOCUMENT: {
        embed.addFields({ name: 'Info', value: messageWithXSeeWhatsapp('arquivo') });
        textChannel.send({ embeds: [ embed ] });
        break;
      }
      case MessageTypes.IMAGE: {
        if (fileIsOverLimit) {
          embed.addFields({ name: 'Info', value: messageFileTooBig() });
          textChannel.send({ embeds: [ embed ] });
        } else {
          const fileName = `Image_Received_${Date.now()}.${fileExtension}`;
          const attachment = new AttachmentBuilder(fileBuffer!, { name: fileName });
          embed.setImage(`attachment://${fileName}`);
          textChannel.send({ embeds: [ embed ], files: [ attachment ] });
        }
        break;
      }
      case MessageTypes.LOCATION: {
        embed.addFields({ name: 'Info', value: messageWithXSeeWhatsapp('localização') });
        textChannel.send({ embeds: [ embed ] });
        break;
      }
      case MessageTypes.STICKER: {
        embed.addFields({ name: 'Info', value: messageWithXSeeWhatsapp('sticker') });
        textChannel.send({ embeds: [ embed ] });
        break;
      }
      case MessageTypes.VIDEO: {
        embed.addFields({ name: 'Info', value: messageWithXSeeWhatsapp('vídeo') });
        textChannel.send({ embeds: [ embed ] });
        break;
      }
      case MessageTypes.VOICE: {
        embed.addFields({ name: 'Info', value: messageWithXSeeWhatsapp('voz') });
        textChannel.send({ embeds: [ embed ] });
        break;
      }
    }
  }
}

export const waBridgeFeature = new WaBridgeFeature();
