import { MessageCreateOptions } from "discord.js";

export const mockMessagePushBranch: MessageCreateOptions = {
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
