
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
  ],
  '2.7.1': [
    'Mudança no texto do mr-stats'
  ],
  '2.8.0': [
    'Tabela de usuários finalmente adicionada!',
    'Comando /task-stats para status de tasks',
    'Comando /trello get-board-ids para pegar ids de boards do Trello',
    'Comando /trello set-board-ids para setar os ids dos boards do Trello',
    'Comando /user add para adicionar novos usuários',
    'Comando /user delete para deletar usuário',
    'Comando /user list para listar usuários',
    'Comando /user edit para editar um usuário',
    'Mencionando usuários em tasks do Trello e Gitlab',
    'Discord.js atualizado para 14.8.0'
  ],
  '2.8.3': [
    'Build insano de rapido'
  ]
}

export function getVersionChangeLog(version: string) {
  return changeLog[version];
}
