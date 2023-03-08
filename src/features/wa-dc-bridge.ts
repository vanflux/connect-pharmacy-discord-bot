import { MessageTypes } from "@open-wa/wa-automate";
import { AttachmentBuilder, EmbedBuilder, TextChannel } from "discord.js";
import { discord } from "../clients/discord";
import { whatsapp } from "../clients/whatsapp";
import { getConfig } from "../config";
import { extension } from "mime-types";

const tearsEmoji = () => ':smiling_face_with_tear:';
const messageWithXSeeWhatsapp = (x: string) => `Mensagem com ${x} ${tearsEmoji()}, olhe o whatsapp`;
const messageFileTooBig = () => `Mensagem com arquivo muito grande ${tearsEmoji()}, olhe o whatsapp`;

export class WaDcBridgeFeature {
  async initialize() {
    const { waChatId, discordWaDcBridgeId } = getConfig();

    discord.client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) return;

      switch (interaction.commandName) {
        case 'wa-clear':
          await interaction.reply('Deleting the last messages, wait...');
          const channel = await discord.client.channels.fetch(discordWaDcBridgeId);
          const textChannel = channel as TextChannel;
          const messages = await textChannel.messages.fetch();
          try {
            for (const message of messages.values()) {
              await message.delete();
            }
          } catch (exc) {}
          break;
      }
    });

    whatsapp.on('message', async message => {
      if (message.chatId !== waChatId) return;
      if (!message.isGroupMsg) return;

      const channel = await discord.client.channels.fetch(discordWaDcBridgeId);
      const textChannel = channel as TextChannel;

      const senderName = message.sender.pushname || 'Unknown';
      const profilePictureUrl = message.sender.profilePicThumbObj?.img;

      const fileFormat = message.mimetype && message.mimetype.includes('/') ? message.mimetype.split('/')[1].split(';')[0] : undefined;
      const fileExtension = message.mimetype ? extension(message.mimetype) : undefined;
      const hasFile = message.mimetype && fileFormat;
      const fileDataUrlBase64 = hasFile ? await whatsapp.client.decryptMedia(message) : undefined;
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
    });
  }
}

export const waDcBridgeFeature = new WaDcBridgeFeature();
