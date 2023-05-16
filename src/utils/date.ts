
export function daysHoursDiff(date1: Date, date2: Date) {
  const millis = Math.abs(date1.getTime() - date2.getTime());
  const hours = millis / (1000 * 60 * 60);
  const days = hours / 24;
  return { hours, days }
}
