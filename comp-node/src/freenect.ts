import { execFile, spawn } from "node:child_process";
import { Observable } from "rxjs";

export type Detection = {
  label: number;
  score: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export const detection$Factory = (saveResults: boolean, silent = false) => {
  const detector = spawn(
    "/Users/sasha/Documents/code/repos/libfreenect2/build/bin/Protonect",
    [
      "1",
      saveResults ? "1" : "0",
      "0",
      "/Users/sasha/Documents/code/repos/IE-minor/images",
    ],
    {
      cwd: "/Users/sasha/Documents/code/repos/libfreenect2/build/bin",
    }
  );

  return new Observable<Detection>((subscriber) => {
    detector.stdout.on("data", (data) => {
      if (!silent) console.log(data.toString());
      const stringData = data.toString();
      if (stringData.split("$$$")[0] === "JSON") {
        const jsonData = JSON.parse(stringData.split("$$$")[1]) as Detection[];
        jsonData.forEach((detection: Detection) => {
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
