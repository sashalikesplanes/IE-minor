import Jimp from "jimp";
import { join } from "path";
import {
  CALIBRATION_SOLID_DURATION,
  DOUBLE_LENGTH_STRIP_INDECES,
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

async function calibrate(startingPixel: number | null = null) {
  await calibrateStripsMap(startingPixel);
  const SILENT = false;
  const detection$ = detection$Factory(SILENT).subscribe();
  await calibrateCameraMap("corridor");
  await calibrateCameraMap("window");
  detection$.unsubscribe();
}

async function calibrateCameraMap(camera: "corridor" | "window") {
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
    dispatchEvents({ type: "clear", next: null });
    dispatchEvents(events);

    await drawCurrentNodeLocation(i);
    const currentPosition = [
      nodeToCameraMap[camera][nodeIdx].x,
      nodeToCameraMap[camera][nodeIdx].y,
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
    nodeToCameraMap[camera][nodeIdx] = { x, y };
    await saveJson(NODE_TO_CAMERA_MAP_REL_PATH, nodeToCameraMap);
  }
  await saveJson(NODE_TO_CAMERA_MAP_REL_PATH, nodeToCameraMap);

  async function drawCurrentNodeLocation(nodeIdx: number) {
    // try to open the latest result image
    const currentX = nodeToCameraMap[camera][nodeIdx].x;
    const currentY = nodeToCameraMap[camera][nodeIdx].y;
    const basePath = join(__dirname, "..", "..", "kinect-nn", "build");
    let image;

    while (!image) {
      try {
        image = await Jimp.read(join(basePath, camera + "_result.jpg"));
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

async function calibrateStripsMap(startingPixel: number | null = null) {
  if ((await askQuestion("Press 0 to skip strip map calibration: ")) === "0")
    return;

  console.log("Calibrating strip map");

  dispatchEvents({ type: "clear", next: null });
  const nodeToStripsMap = loadStripsMap();
  for (let i = startingPixel ?? 0; i < nodeToStripsMap.length; i++) {
    const stripPixels = nodeToStripsMap[i];
    const nodeIdx = i;

    for (let j = 0; j < stripPixels.length; j++) {
      const pixelIdx = stripPixels[j];
      if (pixelIdx === null) {
        continue;
      }
      dispatchEvents({ type: "constant", color: [100, 100, 100], duration: 10_00000, fadein_duration: 100, fadeout_duration: 100, fade_power: 1, pixels: Array(50).fill(0).map((x,i)=>({pixel_idx: i * (DOUBLE_LENGTH_STRIP_INDECES.includes(j) ? 4 : 2), strip_idx: j})),  next: null,  });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const stripIdx = j;

      const event = mapNodeStripPixelToConstantEvent(
        pixelIdx,
        stripIdx,
        NODE_COLOR,
        CALIBRATION_SOLID_DURATION,
        NODE_SOLID_WIDTH
      );

      dispatchEvents({ type: "clear", next: null });
      console.log("Current node is ", nodeIdx);
      console.log(event);
      dispatchEvents(event);

      const answer = (await askQuestion(
        "Enter the offset then press enter OR enter 'null' if this one is not present OR press enter to continue to next node: "
      )) as string;
      if (answer !== "") {
        if (answer === "null" || answer === "n") {
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

if (require.main === module) {
  const arg = process.argv[2];
  const num = arg ? parseInt(arg) : null;
  calibrate(num);
}
