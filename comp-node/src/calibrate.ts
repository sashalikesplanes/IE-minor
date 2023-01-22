// run the camera getting results in
// per node in node list
//
// per strip in that node
// light up the node pixels for that strip
// prompt user for an offset which can be positive or negative
// save the offset to nodemap
// light up the node pixels for that strip again
// if a user presses enter then continue to the next strip
//
// open up the latest picture
// prompt the user for coordinates
// save the coordinates to nodeCameraMap
// continue to the next node

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

    let answer = (await askQuestion(
      "Enter the x and y coordinates separated by a comma (NO SPACE!) (eg. 157,254) or enter to skip: "
    )) as string;
    if (answer === "") continue;
    while (!answer.includes(",")) {
      answer = (await askQuestion(
        "Please enter the x and y coordinates separated by a comma (NO SPACE!) (eg. 157,254): "
      )) as string;
    }

    const [x, y] = answer.split(",").map((v) => parseInt(v));
    nodeToCameraMap["windowCam"][nodeIdx] = { x, y };
  }
  saveJson(NODE_TO_CAMERA_MAP_NAME, nodeToCameraMap);
}
// prompt user for reading the camera
// grab the latest image
// use opencv.js to paint the current node location in green
// prompt user for coordinates, or enter to skip

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
