const sound = require("sound-play");
import { join } from "path";

export async function playSound(
  relativePath: string,
  loop: boolean,
  volume?: number
) {
  if (!volume) volume = 1;
  do {
    await sound.play(join(__dirname, relativePath), volume);
  } while (loop);
}
