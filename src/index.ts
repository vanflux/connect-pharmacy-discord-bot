import 'dotenv/config';
import { discord } from './clients/discord';
import { whatsapp } from './clients/whatsapp';
import { http } from './controllers/http';
import { db } from './database/db';
import { gitlabHookFeature } from './features/gitlab-hook';
import { helpFeature } from './features/help';
import { voiceRankFeature } from './features/voice-rank';
import { waDcBridgeFeature } from './features/wa-dc-bridge';
import { voiceRankService } from './services/voice-rank';

// Handle some termination syscalls
process.on('SIGTERM', () => process.exit());
process.on('SIGINT', () => process.exit());
process.on('SIGUSR1', () => process.exit());
process.on('SIGUSR2', () => process.exit());

async function main() {
  console.log('[Main] Initializing core');
  await Promise.all([
    db.initialize(),
    discord.initialize(),
    whatsapp.initialize(),
    http.initialize(),
  ]);

  console.log('[Main] Initializing services');
  await Promise.all([
    voiceRankService.initialize(),
  ]);

  console.log('[Main] Initializing features');
  await Promise.all([
    helpFeature.initialize(),
    waDcBridgeFeature.initialize(),
    voiceRankFeature.initialize(),
    gitlabHookFeature.initialize(),
  ]);
}

main();
