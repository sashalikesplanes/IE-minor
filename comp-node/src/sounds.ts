const sound = require("sound-play");
import { join } from "path";

export async function playSound(relativePath: string, loop: boolean) {
  do {
    await sound.play(join(__dirname, relativePath));
  } while (loop);
}
