import { Interaction, MessageCreateOptions, TextChannel } from "discord.js";
import { discord } from "../clients/discord";
import { http } from "../controllers/http";
import { configService } from "../services/config";
import { handleExceptions } from "../utils/handle-exceptions";

const testData: MessageCreateOptions = {
  content: "",
  username: null,
  avatar_url: null,
  tts: false,
  embeds: [
    {
      title: null,
      description: "Test User pushed to branch [main](https://tools.ages.pucrs.br/connectpharmacy/connectpharmacy-wiki/commits/main) of [ConnectPharmacy / connectpharmacy-wiki](https://tools.ages.pucrs.br/connectpharmacy/connectpharmacy-wiki) ([Compare changes](https://tools.ages.pucrs.br/connectpharmacy/connectpharmacy-wiki/compare/6da5c1c2276685a996f7c6912cecf52990866c0e...6da5c1c2276685a996f7c6912cecf52990866c0e))\n[6da5c1c2](https://tools.ages.pucrs.br/connectpharmacy/connectpharmacy-wiki/-/commit/6da5c1c2276685a996f7c6912cecf52990866c0e): Initial commit - Test User",
      url: null,
      timestamp: "2023-03-10T20:00:00Z",
      color: 16543014,
      footer: null,
      image: null,
      thumbnail: null,
      video: null,
      provider: null,
      author: {
        name: "Test User",
        url: null,
        icon_url: 'https://www.gravatar.com/avatar/00000000000000000000000000000001?d=identicon&f=y'
      },
      fields: []
    }
  ]
} as any;

export class GitlabHookFeature {
  async initialize() {
    console.log('[GitlabHookFeature] Initializing');

    http.app.post('/hook', handleExceptions(async (req, res) => {
      console.log('[GitlabHookFeature] Hook call:', req.body);
      await this.send(req.body as MessageCreateOptions);
      res.status(200).send();
    }));

    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));

    //await this.send(mockInputData);

    console.log('[GitlabHookFeature] Initialized');
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    const ownerId = configService.get('discord.ownerId');
    if (interaction.user.id !== ownerId) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'gitlab-hook') return;

    switch (interaction.options.getSubcommand()) {
      case 'get-channel': {
        const channelId = configService.get('feature.gitlabHook.channelId');
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
        configService.set('feature.gitlabHook.channelId', interaction.channelId);
        await interaction.reply('Novo canal configurado');
        break;
      }
      case 'test': {
        await interaction.reply('Testando hook');
        await this.send(testData);
        break;
      }
    }
  }

  private async send(message: MessageCreateOptions) {
    const channelId = configService.get('feature.gitlabHook.channelId');
    if (!channelId) return;
    const channel = await discord.client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      const textChannel = channel as TextChannel;
      textChannel.send(message);
    }
  }
}

export const gitlabHookFeature = new GitlabHookFeature();
