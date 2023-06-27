import { join } from "path";
import { getMessageDurationInMs, MessageEvent } from "./events";

export async function playSound(
  relativePath: string,
  loop: boolean,
  volume?: number
) {
  do {
    const { playAudioFile } = await import("audic");
    await playAudioFile(join(__dirname, relativePath));
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
    await playSound(join("..", "assets", "olaf1.1.mp3"), false);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf1.2.mp3"), false);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf1.3.mp3"), false);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf1.4.mp3"), false);
    await new Promise((resolve) => setTimeout(resolve, 20000));

    await playSound(join("..", "assets", "olaf2.1.mp3"), false);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf2.2.mp3"), false);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf2.3.mp3"), false);
    await new Promise((resolve) => setTimeout(resolve, 20000));

    await playSound(join("..", "assets", "olaf3.1.mp3"), false);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf3.2.mp3"), false);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await playSound(join("..", "assets", "olaf3.3.mp3"), false);
    await new Promise((resolve) => setTimeout(resolve, 20000));
  }
}
