import Jimp from "jimp";
import { join } from "path";
import {
  CALIBRATION_SOLID_DURATION,
  NODE_COLOR,
  NODE_SOLID_DURATION,
  NODE_SOLID_WIDTH,
  NODE_TO_CAMERA_MAP_REL_PATH,
  NODE_TO_STRIPS_MAP_REL_PATH,
} from "./config";
import { detection$Factory } from "./freenect";
import {
  mapNodeListToConstantEvents,
  mapNodeStripPixelToConstantEvent,
} from "./mappers";
import { dispatchEvents } from "./serial";
import { askQuestion, loadCameraMap, loadStripsMap, saveJson } from "./utils";

async function calibrate() {
  await calibrateStripsMap();
  const SILENT = true;
  const detection$ = detection$Factory(SILENT).subscribe();
  await calibrateCameraMap();
  detection$.unsubscribe();
}

async function calibrateCameraMap() {
  if ((await askQuestion("Press 0 to skip camera map calibration: ")) === "0")
    return;

  const nodeToCameraMap = loadCameraMap();

  for (let i = 0; i < loadStripsMap().length; i++) {
    const nodeIdx = i;
    const events = mapNodeListToConstantEvents(
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
      nodeToCameraMap["window"][nodeIdx].x,
      nodeToCameraMap["window"][nodeIdx].y,
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
    nodeToCameraMap["window"][nodeIdx] = { x, y };
    saveJson(NODE_TO_CAMERA_MAP_REL_PATH, nodeToCameraMap);
  }
  saveJson(NODE_TO_CAMERA_MAP_REL_PATH, nodeToCameraMap);

  async function drawCurrentNodeLocation(nodeIdx: number) {
    // try to open the latest result image
    const currentX = nodeToCameraMap["window"][nodeIdx].x;
    const currentY = nodeToCameraMap["window"][nodeIdx].y;
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
  const nodeToStripsMap = loadStripsMap();
  for (let i = 0; i < nodeToStripsMap.length; i++) {
    const stripPixels = nodeToStripsMap[i];
    const nodeIdx = i;

    for (let j = 0; j < stripPixels.length; j++) {
      const pixelIdx = stripPixels[j];
      const stripIdx = j;

      if (pixelIdx === null) {
        continue;
      }
      const event = mapNodeStripPixelToConstantEvent(
        pixelIdx,
        stripIdx,
        NODE_COLOR,
        CALIBRATION_SOLID_DURATION,
        NODE_SOLID_WIDTH
      );

      dispatchEvents({ type: "clear" });
      console.log("Current node is ", nodeIdx);
      console.log(event);
      dispatchEvents(event);

      const answer = (await askQuestion(
        "Enter the offset then press enter OR enter 'null' if this one is not present OR press enter to continue to next node: "
      )) as string;
      if (answer !== "") {
        if (answer === "null") {
          nodeToStripsMap[nodeIdx][stripIdx] = null;
          j--;
          continue;
        }
        // update the nodeToStripsMap
        if (pixelIdx === null) {
          nodeToStripsMap[nodeIdx][stripIdx] = parseInt(answer);
        } else {
          nodeToStripsMap[nodeIdx][stripIdx] = pixelIdx - parseInt(answer);
        }
        j--;
      }
      await saveJson(NODE_TO_STRIPS_MAP_REL_PATH, nodeToStripsMap);
    }
  }

  await saveJson(NODE_TO_STRIPS_MAP_REL_PATH, nodeToStripsMap);
}
// calibrate();
if (require.main === module) {
  calibrate();
}
