import request from "request";
import { configService } from "./config";
import { secretService } from "./secret";

export interface TrelloPartialCardDto {
  id: string;
  dateLastActivity: string;
  desc: string;
  idBoard: string;
  idList: string;
  idMembers: string[];
  idMembersVoted: string[];
  idShort: string;
  idAttachmentCover: string;
  labels: {
    id: string;
    idBoard: string;
    name: string;
    color: string;
  }[];
  idLabels: string[];
  name: string;
  pos: number;
  shortLink: string;
  shortUrl: string;
  url: string;
  isTemplate: boolean;
}

export interface TrelloActionDto {
  id: string;
  idMemberCreator: string;
  data: any;
  type: string;
  date: string;
  limits: null,
  member: TrelloMemberDto;
  memberCreator: TrelloMemberDto;
}

export interface TrelloCardDto extends TrelloPartialCardDto {
  actions: TrelloActionDto[];
}

export interface TrelloListDto {
  id: string;
  name: string;
  idBoard: string;
  pos: number;
  status: string;
}

export interface TrelloMembershipDto {
  idMember: string;
  memberType: string;
  unconfirmed: boolean;
  deactivated: boolean;
  id: string;
  member: TrelloMemberDto;
}

export interface TrelloMemberDto {
  id: string;
  activityBlocked: boolean;
  avatarHash: string;
  avatarUrl: string;
  fullName: string;
  idMemberReferrer: string;
  initials: string;
  nonPublicAvailable: boolean;
  username: string;
}

export class TrelloService {
  async getBoardIds() {
    const boardIdsString = await configService.get('trello.boardIds');
    return boardIdsString?.split(',') || [];
  }

  async setBoardIds(boardIds: string[]) {
    await configService.set('trello.boardIds', boardIds.join(','));
  }

  async getLists(boardId: string) {
    const { trello: { apiKey, apiToken } } = secretService.getSecrets();
    return new Promise<TrelloListDto[] | undefined>(resolve => {
      request({
        url: `https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${apiToken}`,
        json: true
      }, (err, response, body) => {
        if (err) return;
        return resolve(body);
      })
    });
  }

  async getCard(cardId: string) {
    const { trello: { apiKey, apiToken } } = secretService.getSecrets();
    return new Promise<TrelloCardDto | undefined>(resolve => {
      request({
        url: `https://api.trello.com/1/cards/${cardId}?key=${apiKey}&token=${apiToken}&actions=addMemberToCard,removeMemberFromCard`,
        json: true
      }, (err, response, body) => {
        if (err) return;
        return resolve(body);
      })
    });
  }

  async getCards(boardId: string) {
    const { trello: { apiKey, apiToken } } = secretService.getSecrets();
    return new Promise<TrelloPartialCardDto[] | undefined>(resolve => {
      request({
        url: `https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${apiToken}`,
        json: true
      }, (err, response, body) => {
        if (err) return;
        return resolve(body);
      })
    });
  }

  async getMemberships(boardId: string) {
    const { trello: { apiKey, apiToken } } = secretService.getSecrets();
    return new Promise<TrelloMembershipDto[] | undefined>(resolve => {
      request({
        url: `https://api.trello.com/1/boards/${boardId}/memberships?key=${apiKey}&token=${apiToken}&member=true`,
        json: true
      }, (err, response, body) => {
        if (err) return;
        return resolve(body);
      })
    });
  }
}

export const trelloService = new TrelloService();
