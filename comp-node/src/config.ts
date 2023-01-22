import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { askQuestion } from "./calibrate";

export const NMS_THRESHOLD = 0.9; // higher allows for more detectins of same hand
export const SCORE_THRESHOLD = 0.3; // lower allows for less confident detections

export const CALIBRATION_SOLID_DURATION = 100_000; // ms
export const MIN_PIXEL_INDEX = 0;
export const MAX_PIXEL_INDEX = 99;

export const DETECTION_BUFFER_TIME_SPAN = 500; // ms
export const DETECTION_BUFFER_CREATION_INTERVAL = 50; // ms

export const NODE_COLOR = [255, 255, 255]; // green, blue, red
export const NODE_SOLID_DURATION = 1_000_000; // ms
export const NODE_SOLID_DURATION_TEST = 500; // ms
export const NODE_SOLID_DURATION_DELAY = 1_000; // ms
export const NODE_SOLID_WIDTH = 1; // pixels

export const MESSAGE_COLOR = [255, 0, 0]; // green, blue, red
export const MESSAGE_WIDTH = 10; // pixels
export const MESSAGE_PACE = 20; // pixels per second
export const MESSAGE_INCLUDE_BACKWARDS = true;

export const SINGLE_COLOR = [100, 50, 0];
export const SINGLE_WIDTH = 3; // pixels
export const SINGLE_DURATION = 1_000; // msg
export const SINGLE_INCLUDE_BACKWARDS = false;

export const NODE_TO_STRIPS_MAP_NAME = "node-to-strips-map.json";
export const NODE_TO_CAMERA_MAP_NAME = "node-to-camera-map.json";
export const nodeToStripsMap = loadJson(NODE_TO_STRIPS_MAP_NAME) as number[][];
export const nodeToCameraMap = loadJson(NODE_TO_CAMERA_MAP_NAME) as {
  windowCam: { x: number; y: number }[];
};

export function loadJson(name: string) {
  return JSON.parse(readFileSync(join(__dirname, name)).toString());
}

export async function saveJson(name: string, object: any) {
  const data = JSON.stringify(object);
  let answer = await askQuestion(
    `Are you sure sure sure you wanna save the following JSON as ${name}?\n` +
      data +
      " (y/n): \n"
  );
  while (answer !== "y" && answer !== "n") {
    answer = await askQuestion("Please enter y or n: ");
  }

  if (answer === "y") {
    writeFileSync(join(__dirname, name), data);
    console.log("file has been saved");
    return;
  }
  return;
}
