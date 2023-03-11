
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
  ]
}

export function getVersionChangeLog(version: string) {
  return changeLog[version];
}
