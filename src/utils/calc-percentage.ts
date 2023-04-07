
export function calcPercentage(value: number, max: number) {
  if (value > max) value = max;
  const percentage = max === 0 ? 0 : (Math.floor(value / max * 1000) / 10);
  return percentage;
}
