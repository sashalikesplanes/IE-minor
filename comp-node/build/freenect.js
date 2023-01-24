"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detection$Factory = void 0;
const node_child_process_1 = require("node:child_process");
const node_path_1 = require("node:path");
const rxjs_1 = require("rxjs");
const config_1 = require("./config");
const KinectNNFlag = {
    start_corridor: config_1.USE_CORRIDOR_CAM,
    start_window: config_1.USE_WINDOW_CAM,
    save_output_image: config_1.SAVE_OUTPUT_IMAGE,
    save_each_output_image: config_1.SAVE_EACH_OUTPUT_IMAGE,
};
// conver KinectNNFlag to an integer
const flag = Object.values(KinectNNFlag).reduce((acc, cur, idx) => (cur ? acc | (1 << idx) : acc), 0);
const detection$Factory = (silent) => {
    let detector = createDetector();
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
        // Restart if we error
        detector.on("error", (err) => {
            subscriber.error(err);
            detector = createDetector();
        });
        return () => {
            detector.kill("SIGINT"); // SIGINT will be handled in KinectNN
        };
    });
    function createDetector() {
        return (0, node_child_process_1.spawn)((0, node_path_1.join)(__dirname, "..", "..", "kinect-nn", "build", "KinectNN"), [
            flag.toString(),
            config_1.SCORE_THRESHOLD.toString(),
            config_1.NMS_THRESHOLD.toString(),
            config_1.WINDOW_CAM_PROBABILITY.toString(),
        ], {
            cwd: (0, node_path_1.join)(__dirname, "..", "..", "kinect-nn", "build"),
        });
    }
};
exports.detection$Factory = detection$Factory;
