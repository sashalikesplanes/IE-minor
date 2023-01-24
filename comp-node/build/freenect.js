"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detection$Factory = void 0;
const node_child_process_1 = require("node:child_process");
const rxjs_1 = require("rxjs");
const config_1 = require("./config");
const detection$Factory = (saveResults, silent = false) => {
    const detector = (0, node_child_process_1.spawn)("/Users/sasha/Documents/code/repos/libfreenect2/build/bin/Protonect", [
        "1",
        saveResults ? "1" : "0",
        "0",
        "/Users/sasha/Documents/code/repos/IE-minor/images",
        config_1.SCORE_THRESHOLD.toString(),
        config_1.NMS_THRESHOLD.toString(),
    ], {
        cwd: "/Users/sasha/Documents/code/repos/libfreenect2/build/bin",
    });
    return new rxjs_1.Observable((subscriber) => {
        detector.stdout.on("data", (data) => {
            if (!silent)
                console.log(data.toString());
            const stringData = data.toString();
            if (stringData.split("$$$")[0] === "JSON") {
                const jsonData = JSON.parse(stringData.split("$$$")[1]);
                jsonData.forEach((detection) => {
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
exports.detection$Factory = detection$Factory;
