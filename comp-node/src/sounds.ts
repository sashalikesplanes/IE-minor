import { join } from "path";
import { NARRATION_VOLUME } from "./config";
const sound = require("sound-play");
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
  return;
}

export async function playSoundPerEvent(
  event: MessageEvent,
  relativePath: string,
  volume?: number
) {
  let durations: number[] = [];
  let currentEvent: MessageEvent | null = event;
  while (currentEvent) {
    durations.push(getMessageDurationInMs(currentEvent));
    currentEvent = currentEvent.next;
  }

  for (let i = 0; i < durations.length; i++) {
    playSound(relativePath, false, volume);
    await new Promise((resolve) => setTimeout(resolve, durations[i]));
  }
}

export async function playNarration() {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 20000));
    await playSound(join("..", "assets", "olaf1.1.mp3"), false, NARRATION_VOLUME);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf1.2.mp3"), false, NARRATION_VOLUME);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf1.3.mp3"), false, NARRATION_VOLUME);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf1.4.mp3"), false, NARRATION_VOLUME);
    await new Promise((resolve) => setTimeout(resolve, 20000));

    await playSound(join("..", "assets", "olaf2.1.mp3"), false, NARRATION_VOLUME);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf2.2.mp3"), false, NARRATION_VOLUME);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf2.3.mp3"), false, NARRATION_VOLUME);
    await new Promise((resolve) => setTimeout(resolve, 20000));

    await playSound(join("..", "assets", "olaf3.1.mp3"), false, NARRATION_VOLUME);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf3.2.mp3"), false, NARRATION_VOLUME);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf3.3.mp3"), false, NARRATION_VOLUME);
    await new Promise((resolve) => setTimeout(resolve, 20000));
  }
}

// export async function playSoundPerEvent(
//   event: MessageEvent,
//   relativePath: string
// ) {
//   let durations: number[] = [];
//   do {
//     durations.push(getMessageDurationInMs(event));
//   } while (event.next);
//
//   for (let i = 0; i < durations.length; i++) {
//     playSound(relativePath, false);
//     await new Promise((resolve) => setTimeout(resolve, durations[i]));
//   }
// }
