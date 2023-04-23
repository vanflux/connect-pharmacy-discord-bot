import { ActionRowBuilder, ComponentType, EmbedBuilder, Interaction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, UserSelectMenuBuilder } from "discord.js";
import { discord } from "../clients/discord";
import { configService } from "../services/config";
import { gitlabService } from "../services/gitlab";
import { trelloService } from "../services/trello";
import { userService } from "../services/user";
import { handleExceptions } from "../utils/handle-exceptions";

const agesLevelCustomId = 'al';
const trelloMemberCustomId = 'tm';
const gitlabUserCustomId = 'gu';
const discordUserCustomId = 'du';

export class UsersFeature {
  async initialize() {
    console.log('[UsersFeature] Initializing');
    discord.client.on('interactionCreate', handleExceptions(interaction => this.onInteractionCreate(interaction)));
    console.log('[UsersFeature] Initialized');
  }

  private async onInteractionCreate(interaction: Interaction) {
    const guildId = configService.get('discord.guildId');
    if (interaction.guildId !== guildId) return;
    const ownerId = configService.get('discord.ownerId');
    if (interaction.user.id !== ownerId) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'user') return;

    switch (interaction.options.getSubcommand()) {
      case 'add': {
        const name = interaction.options.getString('name');
        const agesLevel = interaction.options.getNumber('ages-level');
        if (name == undefined || agesLevel == undefined) return;
        const userId = await userService.create({ name, agesLevel });
        const embed = new EmbedBuilder();
        embed.setTitle('Usuário adicionado');
        embed.setColor('#3959DB');
        embed.setDescription(`Id: ${userId}\nNome: ${name}\nAges: ${agesLevel}`);
        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'delete': {
        const id = interaction.options.getNumber('id');
        if (id == undefined) return;
        const user = await userService.getById(id);
        if (user) {
          await userService.deleteById(id);
          const embed = new EmbedBuilder();
          embed.setTitle('Usuário deletado');
          embed.setColor('#3959DB');
          embed.setDescription(`Id: ${user.id}\nNome: ${user.name}\nAges: ${user.name}`);
          await interaction.reply({ embeds: [embed] });
        } else {
          const embed = new EmbedBuilder();
          embed.setTitle('Usuário não existe');
          embed.setColor('#FF0000');
          await interaction.reply({ embeds: [embed] });
        }
        break;
      }
      case 'list': {
        const users = await userService.getAll();
        const embed = new EmbedBuilder();
        embed.setTitle('Lista de usuários');
        embed.setColor('#3959DB');
        embed.setDescription(users.map(user => (
          `${user.name} [${user.id}]` +
          ` (Ages ${user.agesLevel})` +
          ` (T: ${user.trelloMemberId ? '✅' : '❌'})` +
          ` (G: ${user.gitlabUsername ? '✅' : '❌'})` +
          ` (D: ${user.discordUserId ? '✅' : '❌'})`
        )).join('\n') || ':dizzy_face:');
        await interaction.reply({ embeds: [embed] });
        break;
      }
      case 'edit': {
        const id = interaction.options.getNumber('id');
        if (id == undefined) return;
        const user = await userService.getById(id);
        if (user) {
          const boardIds = await trelloService.getBoardIds();
          const boardId = boardIds[0];
          const trelloMemberships = await trelloService.getMemberships(boardId) || [];

          const projectIds = await gitlabService.getProjectIds();
          const projectId = projectIds[0];
          const projectUsers = await gitlabService.getUsersByProjectId(projectId) || [];
          const validProjectUsers = projectUsers.filter(user => !user.name.includes('**') && !user.username.includes('bot'));

          const embed = new EmbedBuilder();
          embed.setTitle('Edição de usuário');
          embed.setColor('#3959DB');
          embed.setDescription(`${user.name} [${user.id}] (Ages ${user.agesLevel})`);
          const agesLevelSelect = new StringSelectMenuBuilder()
            .setCustomId(agesLevelCustomId)
            .setPlaceholder('Nível da Ages')
            .addOptions(
              new Array(4).fill(0).map((_, i) => (
                new StringSelectMenuOptionBuilder()
                  .setLabel(`Ages ${i + 1}`)
                  .setValue(`${i + 1}`)
                  .setDefault(i + 1 === user.agesLevel)
              ))
            )
          const trelloMemberSelect = new StringSelectMenuBuilder()
            .setCustomId(trelloMemberCustomId)
            .setPlaceholder('Membro do Trello')
            .addOptions(
              ...trelloMemberships.map(membership => (
                new StringSelectMenuOptionBuilder()
                .setLabel(`${membership.member.fullName} (${membership.member.username})`)
                .setValue(membership.idMember)
                .setDefault(user.trelloMemberId === membership.idMember)
              ))
            );
          const gitlabUserSelect = new StringSelectMenuBuilder()
            .setCustomId(gitlabUserCustomId)
            .setPlaceholder('Usuário do Gitlab')
            .addOptions(
              ...validProjectUsers.map(projectUser => (
                new StringSelectMenuOptionBuilder()
                .setLabel(`${projectUser.name} (${projectUser.username})`)
                .setValue(projectUser.username)
                .setDefault(user.gitlabUsername === projectUser.username)
              ))
            );
          const discordUserSelect = new UserSelectMenuBuilder()
            .setCustomId(discordUserCustomId)
            .setPlaceholder(user.discordUserId || 'Usuário do Discord')
          const row1 = new ActionRowBuilder()
            .addComponents(agesLevelSelect);
          const row2 = new ActionRowBuilder()
            .addComponents(trelloMemberSelect);
          const row3 = new ActionRowBuilder()
            .addComponents(gitlabUserSelect);
          const row4 = new ActionRowBuilder()
            .addComponents(discordUserSelect);
          
          const response = await interaction.reply({ embeds: [embed], components: [row1, row2, row3, row4] as any });
          const stringCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 120_000 });
          stringCollector.on('collect', async interaction => {
            switch(interaction.customId) {
              case agesLevelCustomId:
                const agesLevel = parseInt(interaction.values[0]);
                if (!isNaN(agesLevel)) {
                  await userService.update(user.id, {
                    agesLevel,
                  });
                }
                await interaction.reply('Nível da Ages atualizado!');
                break;
              case trelloMemberCustomId:
                const memberId = interaction.values[0];
                await userService.update(user.id, {
                  trelloMemberId: memberId,
                });
                await interaction.reply('Membro do Trello atualizado!');
                break;
              case gitlabUserCustomId:
                const projectUserUsername = interaction.values[0];
                const projectUser = validProjectUsers.find(projectUser => projectUser.username === projectUserUsername)!;
                await userService.update(user.id, {
                  gitlabUserId: projectUser.id,
                  gitlabUsername: projectUserUsername,
                });
                await interaction.reply('Usuário do Gitlab atualizado!');
                break;
            }
          });
          const userCollector = response.createMessageComponentCollector({ componentType: ComponentType.UserSelect, time: 120_000 });
          userCollector.on('collect', async interaction => {
            switch(interaction.customId) {
              case discordUserCustomId:
                const discordUserId = interaction.values[0];
                await userService.update(user.id, {
                  discordUserId,
                });
                await interaction.reply('Usuário do Discord atualizado!');
                break;
            }
          });
        } else {
          const embed = new EmbedBuilder();
          embed.setTitle('Usuário não existe');
          embed.setColor('#FF0000');
          await interaction.reply({ embeds: [embed] });
        }
        break;
      }
    }
  }
}

export const usersFeature = new UsersFeature();
