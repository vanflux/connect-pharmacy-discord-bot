import { MessageTypes } from "@open-wa/wa-automate";
import { AttachmentBuilder, EmbedBuilder, TextChannel } from "discord.js";
import { discord } from "../clients/discord";
import { whatsapp } from "../clients/whatsapp";
import { getConfig } from "../config";
import { extension } from "mime-types";
import { handleExceptions } from "../utils/handle-exceptions";

const tearsEmoji = () => ':smiling_face_with_tear:';
const messageWithXSeeWhatsapp = (x: string) => `Mensagem com ${x} ${tearsEmoji()}, olhe o whatsapp`;
const messageFileTooBig = () => `Mensagem com arquivo muito grande ${tearsEmoji()}, olhe o whatsapp`;

export class WaDcBridgeFeature {
  async initialize() {
    console.log('[WaDcBridgeFeature] Initializing');
    const { feature: { w2dBridge }, discord: { ownerId } } = getConfig();

    discord.client.on('interactionCreate', handleExceptions(async interaction => {
      if (interaction.channelId !== w2dBridge.channelId) return;
      if (interaction.user.id !== ownerId) return;

      if (!interaction.isCommand()) return;

      switch (interaction.commandName) {

        case 'wa-clear':
          await interaction.reply('Disabled temporarily');
          /*await interaction.reply('Deleting the last messages, wait...');
          const channel = await discord.client.channels.fetch(discordWaDcBridgeId);
          const textChannel = channel as TextChannel;
          const messages = await textChannel.messages.fetch();
          try {
            for (const message of messages.values()) {
              await message.delete();
            }
          } catch (exc) {}*/
          break;
      }
    }));

    whatsapp.on('message', handleExceptions(async message => {
      if (message.chatId !== w2dBridge.waChatId) return;
      if (!message.isGroupMsg) return;

      const channel = await discord.client.channels.fetch(w2dBridge.channelId);
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
    }));
    console.log('[WaDcBridgeFeature] Initialized');
  }
}

export const waDcBridgeFeature = new WaDcBridgeFeature();
