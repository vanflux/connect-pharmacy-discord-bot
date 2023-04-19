import 'dotenv/config';
import { discord } from './clients/discord';
import { whatsapp } from './clients/whatsapp';
import { http } from './controllers/http';
import { db } from './database/db';
import { gitlabHookFeature } from './features/gitlab-hook';
import { generalFeature } from './features/general';
import { voiceRankFeature } from './features/voice-rank';
import { waBridgeFeature } from './features/wa-bridge';
import { configService } from './services/config';
import { secretService } from './services/secret';
import { voiceRankService } from './services/voice-rank';
import { trelloHookFeature } from './features/trello-hook';
import { mrStatsFeature } from './features/mr-stats';
import { gitlabFeature } from './features/gitlab';

// Handle some termination syscalls
process.on('SIGTERM', () => process.exit());
process.on('SIGINT', () => process.exit());
process.on('SIGUSR1', () => process.exit());
process.on('SIGUSR2', () => process.exit());

async function main() {
  console.log('[Main] Initializing');
  await secretService.initialize();
  await db.initialize();
  await configService.initialize();
  await Promise.all([
    discord.initialize(),
    whatsapp.initialize(),
    http.initialize(),
  ]);
  await voiceRankService.initialize();
  await Promise.all([
    generalFeature.initialize(),
    waBridgeFeature.initialize(),
    voiceRankFeature.initialize(),
    gitlabHookFeature.initialize(),
    trelloHookFeature.initialize(),
    mrStatsFeature.initialize(),
    gitlabFeature.initialize(),
  ]);

  console.log('[Main] Initialized');
}

main();
