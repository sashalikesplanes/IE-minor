import { spawn } from "node:child_process";
import { join } from "node:path";
import { Observable } from "rxjs";
import {
  NMS_THRESHOLD,
  SAVE_EACH_OUTPUT_IMAGE,
  SAVE_OUTPUT_IMAGE,
  SCORE_THRESHOLD,
  USE_CORRIDOR_CAM,
  USE_WINDOW_CAM,
  WINDOW_CAM_PROBABILITY,
} from "./config";
import { NanodetDetection } from "./mappers";

const KinectNNFlag = {
  start_corridor: USE_CORRIDOR_CAM,
  start_window: USE_WINDOW_CAM,
  save_output_image: SAVE_OUTPUT_IMAGE,
  save_each_output_image: SAVE_EACH_OUTPUT_IMAGE,
};

// conver KinectNNFlag to an integer
const flag = Object.values(KinectNNFlag).reduce(
  (acc, cur, idx) => (cur ? acc | (1 << idx) : acc),
  0
);

export const detection$Factory = (silent: boolean) => {
  const detector = spawn(
    join(__dirname, "..", "..", "kinect-nn", "build", "KinectNN"),
    [
      flag.toString(),
      SCORE_THRESHOLD.toString(),
      NMS_THRESHOLD.toString(),
      WINDOW_CAM_PROBABILITY.toString(),
    ],
    {
      cwd: join(__dirname, "..", "..", "kinect-nn", "build"),
    }
  );

  return new Observable<NanodetDetection>((subscriber) => {
    detector.stdout.on("data", (data) => {
      if (!silent) console.log(data.toString());
      const stringData = data.toString();
      if (stringData.split("$$$")[0] === "JSON") {
        const jsonData = JSON.parse(
          stringData.split("$$$")[1]
        ) as NanodetDetection[];
        jsonData.forEach((detection: NanodetDetection) => {
          subscriber.next(detection);
        });
      }
    });

    detector.stderr.on("data", (data) => {
      subscriber.error(data.toString());
    });

    return () => {
      detector.kill("SIGINT"); // SIGINT will be handled in KinectNN
    };
  });
};
