import { EmbedBuilder, Interaction } from "discord.js";
import { discord } from "../clients/discord";
import { configService } from "../services/config";
import { TrelloListDto, trelloService } from "../services/trello";
import { User, userService } from "../services/user";
import { handleExceptions } from "../utils/handle-exceptions";

export class TaskStatsFeature {
  async initialize() {
    console.log('[TaskStatsFeature] Initializing');
    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));
    console.log('[TaskStatsFeature] Initialized');
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'task-stats') return;

    try {
      const embed = new EmbedBuilder();
      const boardIds = await trelloService.getBoardIds();
      for (const boardId of boardIds) {
        const lists = await trelloService.getLists(boardId);
        if (!lists) throw new Error('Failed to get trello lists');
        const cards = await trelloService.getCards(boardId);
        if (!cards) throw new Error('Failed to get trello cards');
        const monitoringListNames = ['backlog', 'todo', 'doing', 'blocked', 'technical debt', 'code review'];
        const monitoringListById = lists
          .filter(list => monitoringListNames.includes(list.name.toLowerCase()))
          .reduce((acc, list) => Object.assign(acc, {[list.id]: list}), {} as {[id: string]: TrelloListDto});
        const monitoringCards = cards.filter(card => monitoringListById[card.idList]);
        const cardsWithMembers = monitoringCards.filter(card => card.idMembers.length);
        const cardsWithoutMembersCount = monitoringCards.length - cardsWithMembers.length;
        const taskStats = await Promise.all(cardsWithMembers
          .map(async card => ({
            listName: monitoringListById[card.idList].name,
            cardName: card.name,
            cardUrl: card.url,
            memberUsers: await Promise.all(card.idMembers.map(userService.getUserByTrelloMemberId).filter(Boolean)),
          })));
        embed.setTitle('Status das Tasks:');
        embed.setColor('#3959DB');
        let description = '';
        for (const stats of taskStats) {
          description += `> [${stats.cardName}](${stats.cardUrl}) (**${stats.listName}**)\n`;
          description += `${stats.memberUsers.filter(Boolean).map(user => `<@${user?.discordUserId}>`).join(', ')}\n`;
          description += `\n`;
        }
        description += `Cards **SEM** membros: ${cardsWithoutMembersCount}❗\n`;
        embed.setDescription(description);
        await interaction.reply({ embeds: [embed] });
      }
    } catch (exc) {
      console.error('[TaskStatsFeature] Failed to get stats:', exc);
      const embed = new EmbedBuilder();
      embed.setTitle('Falha ao obter status das tasks, quem é o culpado?');
      embed.setColor('#FF0000');
      await interaction.reply({ embeds: [embed] });
    }
  }
}

export const taskStatsFeature = new TaskStatsFeature();
