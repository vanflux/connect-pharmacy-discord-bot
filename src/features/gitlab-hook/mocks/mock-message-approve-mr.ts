import { MessageCreateOptions } from "discord.js";

export const mockMessageApproveMr: MessageCreateOptions = {
  content: "",
  tts: false,
  embeds: [
    {
      type: "rich",
      description: "Test User (test.user) approved merge request [!5 *Adicionando Pré-Commit Hook usando Husky*](https://tools.ages.pucrs.br/connectpharmacy/connectpharmacy-frontend/-/merge_requests/5) in [ConnectPharmacy / connectpharmacy-frontend](https://tools.ages.pucrs.br/connectpharmacy/connectpharmacy-frontend)",
      color: 16543014,
      timestamp: "2023-04-06T12:59:15+00:00",
      author: {
        name: "Test User",
        url: null,
        icon_url: 'https://www.gravatar.com/avatar/00000000000000000000000000000001?d=identicon&f=y'
      }
    }
  ],
} as any;
