import { createCanvas } from "canvas";
import seedrandom from "seedrandom";
import { Sprint } from "../../services/sprint";
import { voiceActivityService } from "../../services/voice-activity";

export async function generateVoiceRankStatsImage(sprint: Sprint) {
  const dayMillis = 1000 * 60 * 60 * 24;
  const days = Math.floor((sprint.endTime.getTime() - sprint.startTime.getTime()) / dayMillis) + 1;
  const now = new Date();

  const startTime = new Date(
    sprint.startTime.getFullYear(),
    sprint.startTime.getMonth(),
    sprint.startTime.getDate(),
    0,
    0,
    0,
    0
  );

  const endTime = new Date(
    sprint.endTime.getFullYear(),
    sprint.endTime.getMonth(),
    sprint.endTime.getDate(),
    0,
    0,
    0,
    0
  );

  const voiceActivities = await voiceActivityService.getActivitiesBetween(startTime, endTime);
  voiceActivities.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Calculate day breaks
  const breaks = new Array(days + 1).fill(0).map((_, i) => (
    new Date(
      startTime.getFullYear(),
      startTime.getMonth(),
      startTime.getDate() + i,
      0,
      0,
      0,
      0
    ).getTime()
  ));

  // Create day buckets
  const dayBuckets = new Array(days).fill(0).map(() => ({
    totalTime: 0,
    timePerUserId: new Map<string, number>(),
  }));

  // Distribute time on day buckets
  for (const voiceActivity of voiceActivities) {
    const userId = voiceActivity.userId;
    const start = voiceActivity.startTime.getTime();
    const end = (voiceActivity.endTime || now).getTime();
    const startDay = Math.floor((start - breaks[0]) / dayMillis);
    const endDay = Math.floor((end - breaks[0]) / dayMillis);
    for (let day = startDay; day <= endDay; day++) {
      const bucket = dayBuckets[day];
      let duration = 0;
      if (day === startDay && day === endDay) {
        duration = end - start; // [Start, End]
      } else if (day === startDay) {
        duration = breaks[day + 1] - start; // [Start, Next break]
      } else if (day === endDay) {
        duration = end - breaks[day]; // [Break, End]
      } else {
        duration = breaks[day + 1] - breaks[day]; // [Break, Next break]
      }
      bucket.totalTime += duration;
      if (!bucket.timePerUserId.has(userId)) {
        bucket.timePerUserId.set(userId, 0);
      }
      bucket.timePerUserId.set(userId, bucket.timePerUserId.get(userId)! + duration);
    }
  }

  // Create image
  const width = 800;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  ctx.scale((width - 20) / width, (height - 40) / height);
  ctx.translate(10, 20);

  const max = Math.max(...dayBuckets.map(bucket => bucket.totalTime));
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';

  const millisToHours = (millis: number) => {
    return Math.floor(millis / 1000 / 60 / 60 * 10) / 10;
  };

  const randomHex = (seed: string) => {
    return Math.floor(seedrandom.alea(seed).quick() * 256).toString(16).padStart(2, '0');
  }

  const randomColor = (seed: string) => {
    return `#${randomHex(seed)}${randomHex(seed + '1')}${randomHex(seed + '2')}`
  };

  for (let day = 0; day < dayBuckets.length; day++) {
    const bucket = dayBuckets[day];
    const totalDurationMillis = bucket.totalTime;
    const totalDurationHours = millisToHours(totalDurationMillis);

    const w = width / days;
    const x = w * day;

    let i = 0;
    for (const [userId, time] of bucket.timePerUserId) {
      console.log(bucket)
      const h = height * (totalDurationMillis / max);
      const y = height - h;
      ctx.fillStyle = randomColor(userId);
      ctx.fillRect(
        Math.floor(x),
        Math.floor(y),
        Math.ceil(w),
        Math.floor(h)
      );
      ctx.fillStyle = 'black';
      ctx.fillText(`${totalDurationHours}h`, x + w / 2, height - h - 5);
      ctx.translate(0, 20);
      const date = new Date(
        startTime.getFullYear(),
        startTime.getMonth(),
        startTime.getDate() + day,
      )
      ctx.fillText(`${date.getDate()}/${date.getMonth() + 1}`, x + w / 2, height);
      ctx.translate(0, - 20);
      i++;
    }
  }

  const buffer = canvas.toBuffer('image/png');
  return buffer;
}
