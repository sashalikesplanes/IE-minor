import { spawn } from "node:child_process";
import { Observable } from "rxjs";
import { NMS_THRESHOLD, SCORE_THRESHOLD } from "./config";
import { NanodetDetection } from "./mappers";

export const detection$Factory = (saveResults: boolean, silent = false) => {
  const detector = spawn(
    "/Users/sasha/Documents/code/repos/libfreenect2/build/bin/Protonect",
    [
      "1",
      saveResults ? "1" : "0",
      "0",
      "/Users/sasha/Documents/code/repos/IE-minor/images",
      SCORE_THRESHOLD.toString(),
      NMS_THRESHOLD.toString(),
    ],
    {
      cwd: "/Users/sasha/Documents/code/repos/libfreenect2/build/bin",
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
      detector.kill();
    };
  });
};
