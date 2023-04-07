
export function translateNumbersToEmojis(num: number) {
  return String(num).split('').map(char => [
    ':zero:', ':one:', ':two:', ':three:', ':four:',
    ':five:', ':six:', ':seven:', ':eight:', ':nine:'
  ][char.charCodeAt(0) - '0'.charCodeAt(0)] || '').join('');
}
