
const changeLog: { [version: string]: string[] } = {
  '2.2.0': [
    'Comando "/wa status" para ver status da conexão com o whatsapp',
  ],
  '2.3.0': [
    'Mostrando changelog na mensagem de update de versão do bot',
  ],
  '2.3.1': [
    'Comando "/voice rank"',
    'Comando "/voice points"',
  ],
  '2.3.2': [
    'Espelhamento das mensagens do whatsapp',
  ],
  '2.4.0': [
    'Hook do trello adicionado'
  ],
  '2.4.1': [
    'Fix em hook do trello'
  ],
  '2.4.2': [
    'Fix em hook do trello'
  ],
  '2.4.3': [
    'Mensagens para criação, atualização(mover entre listas) e deleção de cards no trello'
  ],
  '2.4.4': [
    'Fix em hook do trello'
  ],
  '2.4.5': [
    'Refactor...'
  ],
  '2.5.0': [
    'Mensagens piadas e pontadas no gitlab hook'
  ],
  '2.6.0': [
    'Rank do voice para mês e semana'
  ],
  '2.6.1': [
    'Fix tosco em rank, ordenação...'
  ],
  '2.7.0': [
    'Comando /mr-stats para status de merge requests'
  ]
}

export function getVersionChangeLog(version: string) {
  return changeLog[version];
}
