import { registerFont } from "canvas";
import { resolve } from "path";

export function setupCanvas() {
  registerFont(resolve(__dirname, '../../assets/fonts/arial.ttf'), { family: 'Arial' })
}
