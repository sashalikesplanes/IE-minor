import Jimp from "jimp";
import { join } from "path";
import readline from "readline";
import {
  CALIBRATION_SOLID_DURATION,
  nodeToCameraMap,
  nodeToStripsMap,
  NODE_COLOR,
  NODE_SOLID_DURATION,
  NODE_SOLID_WIDTH,
  NODE_TO_CAMERA_MAP_NAME,
  NODE_TO_STRIPS_MAP_NAME,
  saveJson,
} from "./config";
import { detection$Factory } from "./freenect";
import {
  mapNodeListToSolidEvents,
  mapNodeStripPixelToSolidEvent,
} from "./mapNodeListToSolidEvents";
import { dispatchEvents } from "./serial";

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

async function calibrate() {
  await calibrateStripsMap();
  const SAVE_RESULTS = true;
  const detection$ = detection$Factory(SAVE_RESULTS, true).subscribe();
  await calibrateCameraMap();
  detection$.unsubscribe();
}

async function calibrateCameraMap() {
  if ((await askQuestion("Press 0 to skip camera map calibration: ")) === "0")
    return;

  for (let i = 0; i < nodeToStripsMap.length; i++) {
    const nodeIdx = i;
    const events = mapNodeListToSolidEvents(
      nodeIdx,
      NODE_COLOR,
      NODE_SOLID_DURATION,
      NODE_SOLID_WIDTH
    );
    events.forEach((e) => (e.duration = CALIBRATION_SOLID_DURATION));
    dispatchEvents({ type: "clear" });
    dispatchEvents(events);

    await drawCurrentNodeLocation(i);
    const currentPosition = [
      nodeToCameraMap["windowCam"][nodeIdx].x,
      nodeToCameraMap["windowCam"][nodeIdx].y,
    ].join(",");
    let answer = (await askQuestion(
      `Enter the x and y coordinates separated by a comma (NO SPACE!) (currently ${currentPosition}) or enter to skip: `
    )) as string;
    if (answer === "") continue;
    while (!answer.includes(",")) {
      answer = (await askQuestion(
        `Please enter the x and y coordinates separated by a comma (NO SPACE!) (currentyl ${currentPosition}): `
      )) as string;
      await drawCurrentNodeLocation(i);
    }

    const [x, y] = answer.split(",").map((v) => parseInt(v));
    nodeToCameraMap["windowCam"][nodeIdx] = { x, y };
  }
  saveJson(NODE_TO_CAMERA_MAP_NAME, nodeToCameraMap);

  async function drawCurrentNodeLocation(nodeIdx: number) {
    // try to open the latest result image
    const currentX = nodeToCameraMap["windowCam"][nodeIdx].x;
    const currentY = nodeToCameraMap["windowCam"][nodeIdx].y;
    const basePath = join(__dirname, "..", "..", "images");
    let image;

    while (!image) {
      try {
        image = await Jimp.read(join(basePath, "result.jpg"));
      } catch (e) {
        console.error(e);
      }
    }
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    image
      .print(font, currentX + 10, currentY + 10, nodeIdx.toString())
      .setPixelColour(0x00ff00ff, currentX, currentY)
      .setPixelColour(0x00ff00ff, currentX + 1, currentY)
      .setPixelColor(0x00ff00ff, currentX, currentY + 1)
      .setPixelColor(0x00ff00ff, currentX - 1, currentY)
      .setPixelColor(0x00ff00ff, currentX, currentY - 1)
      .write(join(basePath, "resultWithColor.jpg"));
    // use jimp to draw a green circle at the current node location
    // save the image
  }
}

async function calibrateStripsMap() {
  if ((await askQuestion("Press 0 to skip strip map calibration: ")) === "0")
    return;

  console.log("Calibrating strip map");

  dispatchEvents({ type: "clear" });
  for (let i = 0; i < nodeToStripsMap.length; i++) {
    const stripPixels = nodeToStripsMap[i];
    const nodeIdx = i;

    for (let j = 0; j < stripPixels.length; j++) {
      const pixelIdx = stripPixels[j];
      const stripIdx = j;

      if (pixelIdx === null) continue;

      const solidEvent = mapNodeStripPixelToSolidEvent(
        pixelIdx,
        stripIdx,
        NODE_COLOR,
        CALIBRATION_SOLID_DURATION,
        NODE_SOLID_WIDTH
      );
      dispatchEvents({ type: "clear" });
      dispatchEvents(solidEvent);

      const answer = (await askQuestion(
        "Enter the offset then press enter or press enter to continue to next node: "
      )) as string;
      if (answer !== "") {
        // update the nodeToStripsMap
        nodeToStripsMap[nodeIdx][stripIdx] = pixelIdx - parseInt(answer);
        j--;
      }
    }
  }

  saveJson(NODE_TO_STRIPS_MAP_NAME, nodeToStripsMap);
}
// calibrate();
if (require.main === module) {
  calibrate();
}

// await for user input
// if user presses enter then continue to the next strip
// if user presses escape then exit the program
