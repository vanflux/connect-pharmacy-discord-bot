import 'dotenv/config';
import { discord } from './clients/discord';
import { whatsapp } from './clients/whatsapp';
import { db } from './database/db';
import { voiceRankFeature } from './features/voice-rank';
import { waDcBridgeFeature } from './features/wa-dc-bridge';
import { voiceRankService } from './services/voice-rank-service';

// Handle some termination syscalls
process.on('SIGTERM', () => process.exit());
process.on('SIGINT', () => process.exit());
process.on('SIGUSR1', () => process.exit());
process.on('SIGUSR2', () => process.exit());

async function main() {
  console.log('[Main] Initializing clients');
  await Promise.all([
    db.initialize(),
    discord.initialize(),
    whatsapp.initialize(),
  ]);
  
  console.log('[Main] Initializing features');
  await Promise.all([
    voiceRankService.initialize(),
    waDcBridgeFeature.initialize(),
    voiceRankFeature.initialize(),
  ]);
}

main();
