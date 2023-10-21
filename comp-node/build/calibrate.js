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
const jimp_1 = __importDefault(require("jimp"));
const path_1 = require("path");
const config_1 = require("./config");
const freenect_1 = require("./freenect");
const mappers_1 = require("./mappers");
const serial_1 = require("./serial");
const utils_1 = require("./utils");
function calibrate(startingPixel = null) {
    return __awaiter(this, void 0, void 0, function* () {
        yield calibrateStripsMap(startingPixel);
        const SILENT = false;
        const detection$ = (0, freenect_1.detection$Factory)(SILENT).subscribe();
        yield calibrateCameraMap("corridor");
        yield calibrateCameraMap("window");
        detection$.unsubscribe();
    });
}
function calibrateCameraMap(camera) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield (0, utils_1.askQuestion)("Press 0 to skip camera map calibration: ")) === "0")
            return;
        const nodeToCameraMap = (0, utils_1.loadCameraMap)();
        for (let i = 0; i < (0, utils_1.loadStripsMap)().length; i++) {
            const nodeIdx = i;
            const events = (0, mappers_1.mapNodeListToConstantEvents)(nodeIdx, config_1.NODE_COLOR, config_1.NODE_SOLID_DURATION, config_1.NODE_SOLID_WIDTH);
            events.forEach((e) => (e.duration = config_1.CALIBRATION_SOLID_DURATION));
            (0, serial_1.dispatchEvents)({ type: "clear", next: null });
            (0, serial_1.dispatchEvents)(events);
            yield drawCurrentNodeLocation(i);
            const currentPosition = [
                nodeToCameraMap[camera][nodeIdx].x,
                nodeToCameraMap[camera][nodeIdx].y,
            ].join(",");
            let answer = (yield (0, utils_1.askQuestion)(`Enter the x and y coordinates separated by a comma (NO SPACE!) (currently ${currentPosition}) or enter to skip: `));
            if (answer === "")
                continue;
            while (!answer.includes(",")) {
                answer = (yield (0, utils_1.askQuestion)(`Please enter the x and y coordinates separated by a comma (NO SPACE!) (currentyl ${currentPosition}): `));
                yield drawCurrentNodeLocation(i);
            }
            const [x, y] = answer.split(",").map((v) => parseInt(v));
            nodeToCameraMap[camera][nodeIdx] = { x, y };
            yield (0, utils_1.saveJson)(config_1.NODE_TO_CAMERA_MAP_REL_PATH, nodeToCameraMap);
        }
        yield (0, utils_1.saveJson)(config_1.NODE_TO_CAMERA_MAP_REL_PATH, nodeToCameraMap);
        function drawCurrentNodeLocation(nodeIdx) {
            return __awaiter(this, void 0, void 0, function* () {
                // try to open the latest result image
                const currentX = nodeToCameraMap[camera][nodeIdx].x;
                const currentY = nodeToCameraMap[camera][nodeIdx].y;
                const basePath = (0, path_1.join)(__dirname, "..", "..", "kinect-nn", "build");
                let image;
                while (!image) {
                    try {
                        image = yield jimp_1.default.read((0, path_1.join)(basePath, camera + "_result.jpg"));
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
function calibrateStripsMap(startingPixel = null) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield (0, utils_1.askQuestion)("Press 0 to skip strip map calibration: ")) === "0")
            return;
        console.log("Calibrating strip map");
        (0, serial_1.dispatchEvents)({ type: "clear", next: null });
        const nodeToStripsMap = (0, utils_1.loadStripsMap)();
        for (let i = startingPixel !== null && startingPixel !== void 0 ? startingPixel : 0; i < nodeToStripsMap.length; i++) {
            const stripPixels = nodeToStripsMap[i];
            const nodeIdx = i;
            for (let j = 0; j < stripPixels.length; j++) {
                const pixelIdx = stripPixels[j];
                if (pixelIdx === null) {
                    continue;
                }
                (0, serial_1.dispatchEvents)({ type: "constant", color: [100, 100, 100], duration: 1000000, fadein_duration: 100, fadeout_duration: 100, fade_power: 1, pixels: Array(50).fill(0).map((x, i) => ({ pixel_idx: i * (config_1.DOUBLE_LENGTH_STRIP_INDECES.includes(j) ? 4 : 2), strip_idx: j })), next: null, });
                yield new Promise((resolve) => setTimeout(resolve, 500));
                const stripIdx = j;
                const event = (0, mappers_1.mapNodeStripPixelToConstantEvent)(pixelIdx, stripIdx, config_1.NODE_COLOR, config_1.CALIBRATION_SOLID_DURATION, config_1.NODE_SOLID_WIDTH);
                (0, serial_1.dispatchEvents)({ type: "clear", next: null });
                console.log("Current node is ", nodeIdx);
                console.log(event);
                (0, serial_1.dispatchEvents)(event);
                const answer = (yield (0, utils_1.askQuestion)("Enter the offset then press enter OR enter 'null' if this one is not present OR press enter to continue to next node: "));
                if (answer !== "") {
                    if (answer === "null" || answer === "n") {
                        nodeToStripsMap[nodeIdx][stripIdx] = null;
                        j--;
                        continue;
                    }
                    // update the nodeToStripsMap
                    if (pixelIdx === null) {
                        nodeToStripsMap[nodeIdx][stripIdx] = parseInt(answer);
                    }
                    else {
                        nodeToStripsMap[nodeIdx][stripIdx] = pixelIdx - parseInt(answer);
                    }
                    j--;
                }
                yield (0, utils_1.saveJson)(config_1.NODE_TO_STRIPS_MAP_REL_PATH, nodeToStripsMap);
            }
        }
        yield (0, utils_1.saveJson)(config_1.NODE_TO_STRIPS_MAP_REL_PATH, nodeToStripsMap);
    });
}
if (require.main === module) {
    const arg = process.argv[2];
    const num = arg ? parseInt(arg) : null;
    calibrate(num);
}
