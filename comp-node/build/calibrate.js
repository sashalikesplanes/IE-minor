"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askQuestion = void 0;
const jimp_1 = __importDefault(require("jimp"));
const path_1 = require("path");
const readline_1 = __importDefault(require("readline"));
const config_1 = require("./config");
const freenect_1 = require("./freenect");
const mappers_1 = require("./mappers");
const serial_1 = require("./serial");
function askQuestion(query) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
    }));
}
exports.askQuestion = askQuestion;
function calibrate() {
    return __awaiter(this, void 0, void 0, function* () {
        yield calibrateStripsMap();
        const SAVE_RESULTS = true;
        const detection$ = (0, freenect_1.detection$Factory)(SAVE_RESULTS, true).subscribe();
        yield calibrateCameraMap();
        detection$.unsubscribe();
    });
}
function calibrateCameraMap() {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield askQuestion("Press 0 to skip camera map calibration: ")) === "0")
            return;
        const nodeToCameraMap = (0, config_1.loadCameraMap)();
        for (let i = 0; i < (0, config_1.loadStripsMap)().length; i++) {
            const nodeIdx = i;
            const events = (0, mappers_1.mapNodeListToSolidEvents)(nodeIdx, config_1.NODE_COLOR, config_1.NODE_SOLID_DURATION, config_1.NODE_SOLID_WIDTH);
            events.forEach((e) => (e.duration = config_1.CALIBRATION_SOLID_DURATION));
            (0, serial_1.dispatchEvents)({ type: "clear" });
            (0, serial_1.dispatchEvents)(events);
            yield drawCurrentNodeLocation(i);
            const currentPosition = [
                nodeToCameraMap["windowCam"][nodeIdx].x,
                nodeToCameraMap["windowCam"][nodeIdx].y,
            ].join(",");
            let answer = (yield askQuestion(`Enter the x and y coordinates separated by a comma (NO SPACE!) (currently ${currentPosition}) or enter to skip: `));
            if (answer === "")
                continue;
            while (!answer.includes(",")) {
                answer = (yield askQuestion(`Please enter the x and y coordinates separated by a comma (NO SPACE!) (currentyl ${currentPosition}): `));
                yield drawCurrentNodeLocation(i);
            }
            const [x, y] = answer.split(",").map((v) => parseInt(v));
            nodeToCameraMap["windowCam"][nodeIdx] = { x, y };
        }
        (0, config_1.saveJson)(config_1.NODE_TO_CAMERA_MAP_NAME, nodeToCameraMap);
        function drawCurrentNodeLocation(nodeIdx) {
            return __awaiter(this, void 0, void 0, function* () {
                // try to open the latest result image
                const currentX = nodeToCameraMap["windowCam"][nodeIdx].x;
                const currentY = nodeToCameraMap["windowCam"][nodeIdx].y;
                const basePath = (0, path_1.join)(__dirname, "..", "..", "images");
                let image;
                while (!image) {
                    try {
                        image = yield jimp_1.default.read((0, path_1.join)(basePath, "result.jpg"));
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                const font = yield jimp_1.default.loadFont(jimp_1.default.FONT_SANS_32_WHITE);
                image
                    .print(font, currentX + 10, currentY + 10, nodeIdx.toString())
                    .setPixelColour(0x00ff00ff, currentX, currentY)
                    .setPixelColour(0x00ff00ff, currentX + 1, currentY)
                    .setPixelColor(0x00ff00ff, currentX, currentY + 1)
                    .setPixelColor(0x00ff00ff, currentX - 1, currentY)
                    .setPixelColor(0x00ff00ff, currentX, currentY - 1)
                    .write((0, path_1.join)(basePath, "resultWithColor.jpg"));
                // use jimp to draw a green circle at the current node location
                // save the image
            });
        }
    });
}
function calibrateStripsMap() {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield askQuestion("Press 0 to skip strip map calibration: ")) === "0")
            return;
        console.log("Calibrating strip map");
        (0, serial_1.dispatchEvents)({ type: "clear" });
        const nodeToStripsMap = (0, config_1.loadStripsMap)();
        for (let i = 0; i < nodeToStripsMap.length; i++) {
            const stripPixels = nodeToStripsMap[i];
            const nodeIdx = i;
            for (let j = 0; j < stripPixels.length; j++) {
                const pixelIdx = stripPixels[j];
                const stripIdx = j;
                if (pixelIdx === null)
                    continue;
                const solidEvent = (0, mappers_1.mapNodeStripPixelToSolidEvent)(pixelIdx, stripIdx, config_1.NODE_COLOR, config_1.CALIBRATION_SOLID_DURATION, config_1.NODE_SOLID_WIDTH);
                (0, serial_1.dispatchEvents)({ type: "clear" });
                (0, serial_1.dispatchEvents)(solidEvent);
                const answer = (yield askQuestion("Enter the offset then press enter or press enter to continue to next node: "));
                if (answer !== "") {
                    // update the nodeToStripsMap
                    nodeToStripsMap[nodeIdx][stripIdx] = pixelIdx - parseInt(answer);
                    j--;
                }
            }
        }
        (0, config_1.saveJson)(config_1.NODE_TO_STRIPS_MAP_NAME, nodeToStripsMap);
    });
}
// calibrate();
if (require.main === module) {
    calibrate();
}
