import { EmbedBuilder, Interaction, MessageCreateOptions, TextChannel } from "discord.js";
import { discord } from "../clients/discord";
import { http } from "../controllers/http";
import { configService } from "../services/config";
import { handleExceptions } from "../utils/handle-exceptions";

const testCreateCardData = {
  model: {
    url: 'https://trello.com/b/j2Vt2EvR/desenvolvimento',
    shortUrl: 'https://trello.com/b/j2Vt2EvR',
  },
  action: {
    id: '640de4e4a21e054bab824692',
    idMemberCreator: '5f3e92a796e9e27898f1fd94',
    data: {
      card: {
        id: '640de4e4a21e054bab824688',
        name: '123',
        idShort: 3,
        shortLink: 'WYRJr0XN'
      },
      list: { id: '640cf6824b12a01410a65d46', name: 'TODO' },
      board: {
        id: '640cf6824b12a01410a65d3f',
        name: 'Desenvolvimento',
        shortLink: 'j2Vt2EvR'
      }
    },
    type: 'createCard',
    date: '2023-03-12T14:42:44.144Z',
    memberCreator: {
      fullName: 'Test User'
    }
  }
};

const testUpdateCardData = {
  model: {
    url: 'https://trello.com/b/j2Vt2EvR/desenvolvimento',
    shortUrl: 'https://trello.com/b/j2Vt2EvR',
  },
  action: {
    id: '640de4f77f1594f1a7a80118',
    idMemberCreator: '5f3e92a796e9e27898f1fd94',
    data: {
      card: {
        idList: '640cf6824b12a01410a65d47',
        id: '640de4e4a21e054bab824688',
        name: '123',
        idShort: 3,
        shortLink: 'WYRJr0XN'
      },
      old: { idList: '640cf6824b12a01410a65d46' },
      board: {
        id: '640cf6824b12a01410a65d3f',
        name: 'Desenvolvimento',
        shortLink: 'j2Vt2EvR'
      },
      listBefore: { id: '640cf6824b12a01410a65d46', name: 'TODO' },
      listAfter: { id: '640cf6824b12a01410a65d47', name: 'Doing' }
    },
    type: 'updateCard',
    date: '2023-03-12T14:43:03.663Z',
    memberCreator: {
      fullName: 'Test User'
    }
  }
};

const testDeleteCardData = {
  model: {
    url: 'https://trello.com/b/j2Vt2EvR/desenvolvimento',
    shortUrl: 'https://trello.com/b/j2Vt2EvR'
  },
  action: {
    data: {
      card: {
        id: '640de4e4a21e054bab824688',
        idShort: 3,
        shortLink: 'WYRJr0XN'
      },
      list: { id: '640cf6824b12a01410a65d48', name: 'Done' },
      board: {
        id: '640cf6824b12a01410a65d3f',
        name: 'Desenvolvimento',
        shortLink: 'j2Vt2EvR'
      }
    },
    type: 'deleteCard',
    date: '2023-03-12T14:43:12.078Z',
    memberCreator: {
      fullName: 'Test User'
    }
  }
};

export class TrelloHookFeature {
  async initialize() {
    console.log('[TrelloHookFeature] Initializing');

    http.app.head('/trello/hook', handleExceptions(async (req, res) => {
      console.log('[TrelloHookFeature] Hook head call:', req.body);
      res.status(200).send();
    }));

    http.app.post('/trello/hook', handleExceptions(async (req, res) => {
      console.log('[TrelloHookFeature] Hook post call:', req.body);
      await this.send(req.body);
      res.status(200).send();
    }));

    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));

    console.log('[TrelloHookFeature] Initialized');
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    const ownerId = configService.get('discord.ownerId');
    if (interaction.user.id !== ownerId) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'trello-hook') return;

    switch (interaction.options.getSubcommand()) {
      case 'get-channel': {
        const channelId = configService.get('feature.trelloHook.channelId');
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
        configService.set('feature.trelloHook.channelId', interaction.channelId);
        await interaction.reply('Novo canal configurado');
        break;
      }
      case 'test': {
        await interaction.reply('Testando hook');
        const testDatas = [testCreateCardData, testUpdateCardData, testDeleteCardData];
        const testData = testDatas[Math.floor(testDatas.length * Math.random())];
        this.send(testData);
        break;
      }
    }
  }

  private createMessage(data: any): MessageCreateOptions | undefined {
    if (!data) return;
    const action = data.action;
    const model = data.model;
    if (!action || !model) return;
    const memberCreator = action.memberCreator;
    const fullName = memberCreator.fullName || 'Unknown';
    const avatarUrl = memberCreator.avatarUrl ? `${memberCreator.avatarUrl}/50.png` : 'https://www.gravatar.com/avatar/00000000000000000000000000000001?d=identicon&f=y';
    const boardUrl = model.url;
    
    const cardId = action?.data.card?.id;
    const cardUrl = `https://trello.com/c/${cardId}`;
    const cardName = action?.data?.card?.name || '';
    const listName = action?.data.list?.name?.toUpperCase?.() || '';
    const listBeforeName = action?.data.listBefore?.name?.toUpperCase?.() || '';
    const listAfterName = action?.data.listAfter?.name?.toUpperCase?.() || '';
    
    const embed = new EmbedBuilder();
    switch (action.type) {
      case 'createCard': {
        if (!cardName || !listName) return;
        embed.setDescription(`${fullName} **adicionou** o card [${cardName}](${cardUrl}) no [${listName}](${boardUrl}) no [board](${boardUrl})`);
        break;
      }
      case 'updateCard': {
        if (!listBeforeName || !listAfterName) return;
        embed.setDescription(`${fullName} **moveu** o card [${cardName}](${cardUrl}) de [${listBeforeName}](${boardUrl}) para [${listAfterName}](${boardUrl}) no [board](${boardUrl})`);
        break;
      }
      case 'deleteCard': {
        if (!listName) return;
        embed.setDescription(`${fullName} **deletou** um card do [${listName}](${boardUrl}) do [board](${boardUrl})`);
        break;
      }
      default:
        return;
    }
    embed.setTimestamp(new Date());
    embed.setColor('#026AA7');
    embed.setAuthor({
      name: fullName,
      iconURL: avatarUrl,
    });
    return { embeds: [embed] };
  }

  private async send(data: any) {
    const channelId = configService.get('feature.trelloHook.channelId');
    if (!channelId) return;
    const channel = await discord.client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      const textChannel = channel as TextChannel;
      const message = this.createMessage(data);
      if (message) textChannel.send(message);
    }
  }
}

export const trelloHookFeature = new TrelloHookFeature();
