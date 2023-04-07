import { MessageCreateOptions } from "discord.js";

export const mockMessageOpenMr: MessageCreateOptions = {
  content: "",
  pinned: false,
  tts: false,
  embeds: [
    {
      type: "rich",
      description: "Test User (test.user) opened merge request [!2 *Fix/18 - Adicionado objeto usuário no retorno do login*](https://tools.ages.pucrs.br/connectpharmacy/connectpharmacy-backend/-/merge_requests/2) in [ConnectPharmacy / connectpharmacy-backend](https://tools.ages.pucrs.br/connectpharmacy/connectpharmacy-backend)",
      color: 16543014,
      timestamp: "2023-04-07T01:49:34+00:00",
      author: {
        name: "Test User",
        url: null,
        icon_url: 'https://www.gravatar.com/avatar/00000000000000000000000000000001?d=identicon&f=y'
      }
    }
  ],
} as any;
