import { APIEmbed, APIEmbedAuthor, ColorResolvable, Embed, EmbedAuthorOptions, EmbedBuilder, Interaction, MessageCreateOptions, TextChannel } from "discord.js";
import { discord } from "../../clients/discord";
import { http } from "../../controllers/http";
import { configService } from "../../services/config";
import { handleExceptions } from "../../utils/handle-exceptions";
import { getRandomMockMessage } from "./mocks/random";

export class GitlabHookFeature {
  async initialize() {
    console.log('[GitlabHookFeature] Initializing');

    http.app.post('/hook', handleExceptions(async (req, res) => {
      console.log('[GitlabHookFeature] Hook call:', req.body);
      await this.send(req.body as MessageCreateOptions);
      res.status(200).send();
    }));

    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));

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
        await this.send(getRandomMockMessage());
        break;
      }
    }
  }

  private parseMessage(message: MessageCreateOptions) {
    const embed = message.embeds?.[0] as APIEmbed | undefined;
    if (!embed) return;
    const { description, author } = embed;
    let match = description?.match(/([\w ]+) pushed to branch \[([^\]]+)\]\(([^\)]+)\) of \[([^\]]+)\]\(([^\)]+)\) \(\[Compare changes\]\(([^\)]+)\)\)/);
    if (match) {
      const [_, userName, branchName, branchUrl, projectName, projectUrl, changeUrl] = match;
      return {
        type: 'push',
        userName,
        branchName,
        branchUrl,
        projectName,
        projectUrl,
        changeUrl,
        author,
      } as const;
    }
    match = description?.match(/([\w ]+) \(([^\)]+)\) opened merge request \[([^\]]+)\]\(([^\)]+)\) in \[([^\]]+)\]\(([^\)]+)\)/);
    if (match) {
      const [_, userName, username, mrName, mrUrl, projectName, projectUrl] = match;
      return {
        type: 'open-mr',
        userName,
        username,
        mrName,
        mrUrl,
        projectName,
        projectUrl,
        author,
      } as const;
    }
    match = description?.match(/([\w ]+) \(([^\)]+)\) merged merge request \[([^\]]+)\]\(([^\)]+)\) in \[([^\]]+)\]\(([^\)]+)\)/);
    if (match) {
      const [_, userName, username, mrName, mrUrl, projectName, projectUrl] = match;
      return {
        type: 'merge-mr',
        userName,
        username,
        mrName,
        mrUrl,
        projectName,
        projectUrl,
        author,
      } as const;
    }
    match = description?.match(/([\w ]+) \(([^\)]+)\) approved merge request \[([^\]]+)\]\(([^\)]+)\) in \[([^\]]+)\]\(([^\)]+)\)/);
    if (match) {
      const [_, userName, username, mrName, mrUrl, projectName, projectUrl] = match;
      return {
        type: 'approve-mr',
        userName,
        username,
        mrName,
        mrUrl,
        projectName,
        projectUrl,
        author,
      } as const;
    }
  }

  private parseApiToAuthorOptions(apiEmbedAuthor?: APIEmbedAuthor): EmbedAuthorOptions {
    return {
      name: apiEmbedAuthor?.name || '-',
      iconURL: apiEmbedAuthor?.icon_url || apiEmbedAuthor?.proxy_icon_url,
      url: apiEmbedAuthor?.url,
    }
  }

  private generateMessage(message: MessageCreateOptions) {
    const parsed = this.parseMessage(message);
    const color: ColorResolvable = 'Orange';
    const now = new Date();
    switch(parsed?.type) {
      case 'push':
        return {
          embeds: [
            new EmbedBuilder()
              .setTitle(`Push na "**${parsed.branchName}**" do ${parsed.projectName?.split('/')?.pop()?.trim()}`)
              .setAuthor(this.parseApiToAuthorOptions(parsed.author))
              .setColor(color)
              .setTimestamp(now)
              .setDescription(
                `${parsed.userName} deu push na [${parsed.branchName}](${parsed.branchUrl}):\n` +
                `- Branch: [${parsed.branchName}](${parsed.branchUrl})\n` +
                `- Projeto [${parsed.projectName?.split('/')?.pop()?.trim()}](${parsed.projectUrl})\n` +
                `- Changes: [Link das alterações](${parsed.changeUrl})\n` +
                `\n` +
                `Que absurdooooo!!!\n`
              ),
          ],
        };
      case 'open-mr':
        return {
          embeds: [
            new EmbedBuilder()
              .setTitle(`MR aberto no ${parsed.projectName?.split('/')?.pop()?.trim()}`)
              .setAuthor(this.parseApiToAuthorOptions(parsed.author))
              .setColor(color)
              .setTimestamp(now)
              .setDescription(
                `${parsed.userName} abriu um MR:\n` +
                `- Nome: [${parsed.mrName}](${parsed.mrUrl})\n` +
                `- Projeto: [${parsed.projectName?.split('/')?.pop()?.trim()}](${parsed.projectUrl})\n` +
                `\n` +
                `Isso mesmo AGES III e AGES IV!!!\n` +
                `Larguem o CHEETOS imediatamente e vão revisar!!!\n`
              ),
          ],
        };
      case 'merge-mr':
        return {
          embeds: [
            new EmbedBuilder()
              .setTitle(`Um MR foi mergeado na ${parsed.projectName?.split('/')?.pop()?.trim()}`)
              .setAuthor(this.parseApiToAuthorOptions(parsed.author))
              .setColor(color)
              .setTimestamp(now)
              .setDescription(
                `${parsed.userName} mergeou um MR:\n` +
                `- Nome: [${parsed.mrName}](${parsed.mrUrl})\n` +
                `- Projeto: [${parsed.projectName?.split('/')?.pop()?.trim()}](${parsed.projectUrl})\n` +
                `\n` +
                `Ai ai, mal ele sabe que ta tudo bugado e ele vai\n` +
                `ser o culpado disso tudo!!! Ta lascado meu chapa!`
              ),
          ],
        };
      case 'approve-mr':
        return {
          embeds: [
            new EmbedBuilder()
              .setTitle(`MR aprovado na ${parsed.projectName?.split('/')?.pop()?.trim()}`)
              .setAuthor(this.parseApiToAuthorOptions(parsed.author))
              .setColor(color)
              .setTimestamp(now)
              .setDescription(
                `${parsed.userName} aprovou um MR:\n` +
                `- Nome: [${parsed.mrName}](${parsed.mrUrl})\n` +
                `- Projeto: [${parsed.projectName?.split('/')?.pop()?.trim()}](${parsed.projectUrl})\n` +
                `\n` +
                `Ai ai, ele foi todo todo confiante!\n` +
                `Mal ele sabe...`
              ),
          ],
        };
    }
    return message;
  }

  private async send(message: MessageCreateOptions) {
    const channelId = configService.get('feature.gitlabHook.channelId');
    if (!channelId) return;
    const channel = await discord.client.channels.fetch(channelId);

    if (channel?.isTextBased()) {
      const textChannel = channel as TextChannel;
      const generatedMessage = this.generateMessage(message);
      textChannel.send(generatedMessage);
    }
  }
}

export const gitlabHookFeature = new GitlabHookFeature();
