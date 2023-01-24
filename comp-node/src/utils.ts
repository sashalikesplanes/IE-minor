import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import readline from "readline";
import {
  NODE_TO_CAMERA_MAP_REL_PATH,
  NODE_TO_STRIPS_MAP_REL_PATH,
} from "./config";

export function askQuestion(query: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

export function loadJson(name: string) {
  return JSON.parse(readFileSync(join(__dirname, name)).toString());
}

export const loadStripsMap = () => {
  return loadJson(NODE_TO_STRIPS_MAP_REL_PATH) as (number | null)[][];
};

export function loadCameraMap() {
  return loadJson(NODE_TO_CAMERA_MAP_REL_PATH) as {
    window: { x: number; y: number }[];
    corridor: { x: number; y: number }[];
  };
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
