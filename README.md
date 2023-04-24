# Connect Pharmacy Discord Bot

## O que é

Este projeto é um bot de discord desenvolvido para projetos da Ages, mais especificamente para a Connect Pharmacy.

Você pode reaproveitar boa parte desse repositório caso queira usar apenas algumas funcionalidades.

## Features

- Espelhamento de mensagens do whatsapp:
  - Essa funcionalidade replica as mensagens de um chat do whatsapp para um canal específico do Discord. Bom para ter um lugar central(discord) com todas informações reunidas.
- Rank de usuários dos canais de voz:
  - O bot grava o tempo que todos usuários ficam ativos nos canais de voz, é possível ver o rank usando o comando `/voice rank`
- Hook do Trello:
  - O bot avisa sobre alterações que ocorrem no Trello(cards criados, deletados, movidos, etc.). É bom porque geralmente **ninguém sabe que o Trello existe**... isso acaba inevitavelmente fazendo com que todo mundo perceba a existência dele e que COISAS estão acontecendo! Parece que o pessoal se mexe mais.
- Hook do Gitlab:
  - O Gitlab já possui um webhook para mandar mensagens no Discord, porém com o bot é possível customizar as mensagens e deixar elas mais **interessantes** se é que me entende...
- Status de Merge Requests do Gitlab:
  - É possível utilizar o comando `/mr-stats` para que o bot extraia informações de todos os merge requests abertos(e que **não são WIPs**) e faça um resumo de todos com o que falta ser feito, exemplo: conflitos e comentários para resolver.
- Status das Tasks do Trello:
  - É possível utilizar o comando `/task-stats` para que o bot extraia informações dos cards do Trello e faça um resumo de todos.
- Interligação entre usuários do Discord + Gitlab + Trello:
  - Um usuário possui todas essas informações, sendo possível detectar e mencionar usuários no Discord baseado nos membros dos boards do Trello.

## Extra

Essa ideia de gerico de mensagens "piadas e pontadas" nos approves, merges e tal veio do [Arthur Ibarra](https://github.com/ArthurSudbrackIbarra/)<br>
Mas ficou muito bom kkkkkkkkk
