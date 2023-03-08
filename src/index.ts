import 'dotenv/config';
import { discord } from './clients/discord';
import { whatsapp } from './clients/whatsapp';
import { waDcBridgeFeature } from './features/wa-dc-bridge';

async function main() {
  console.log('Initializing clients...');
  await Promise.all([
    discord.initialize(),
    whatsapp.initialize(),
  ]);
  
  console.log('Initializing features...');
  await Promise.all([
    waDcBridgeFeature.initialize(),
  ]);
}

main();
