const sound = require("sound-play");
import { join } from "path";
import { getMessageDurationInMs, MessageEvent } from "./events";

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

export async function playSoundPerEvent(
  event: MessageEvent,
  relativePath: string
) {
  let durations: number[] = [];
  do {
    durations.push(getMessageDurationInMs(event));
  } while (event.next);

  for (let i = 0; i < durations.length; i++) {
    playSound(relativePath, false);
    await new Promise((resolve) => setTimeout(resolve, durations[i]));
  }
}
