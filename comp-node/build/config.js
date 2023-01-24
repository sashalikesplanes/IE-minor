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
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJson = exports.loadJson = exports.loadCameraMap = exports.loadStripsMap = exports.NODE_TO_CAMERA_MAP_NAME = exports.NODE_TO_STRIPS_MAP_NAME = exports.SINGLE_INCLUDE_BACKWARDS = exports.SINGLE_DURATION = exports.SINGLE_WIDTH = exports.SINGLE_COLOR = exports.MESSAGE_INCLUDE_BACKWARDS = exports.MESSAGE_PACE = exports.MESSAGE_WIDTH = exports.MESSAGE_COLOR = exports.NODE_SOLID_WIDTH = exports.NODE_SOLID_DURATION_DELAY = exports.NODE_SOLID_DURATION_TEST = exports.NODE_SOLID_DURATION = exports.NODE_COLOR = exports.DETECTION_BUFFER_CREATION_INTERVAL = exports.DETECTION_BUFFER_TIME_SPAN = exports.MAX_PIXEL_INDEX = exports.MIN_PIXEL_INDEX = exports.CALIBRATION_SOLID_DURATION = exports.SCORE_THRESHOLD = exports.NMS_THRESHOLD = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const calibrate_1 = require("./calibrate");
exports.NMS_THRESHOLD = 0.9; // higher allows for more detectins of same hand
exports.SCORE_THRESHOLD = 0.3; // lower allows for less confident detections
exports.CALIBRATION_SOLID_DURATION = 100000; // ms
exports.MIN_PIXEL_INDEX = 0;
exports.MAX_PIXEL_INDEX = 99;
exports.DETECTION_BUFFER_TIME_SPAN = 500; // ms
exports.DETECTION_BUFFER_CREATION_INTERVAL = 50; // ms
exports.NODE_COLOR = [255, 255, 255]; // green, blue, red
exports.NODE_SOLID_DURATION = 1000000; // ms
exports.NODE_SOLID_DURATION_TEST = 500; // ms
exports.NODE_SOLID_DURATION_DELAY = 1000; // ms
exports.NODE_SOLID_WIDTH = 1; // pixels
exports.MESSAGE_COLOR = [255, 0, 0]; // green, blue, red
exports.MESSAGE_WIDTH = 10; // pixels
exports.MESSAGE_PACE = 20; // pixels per second
exports.MESSAGE_INCLUDE_BACKWARDS = true;
exports.SINGLE_COLOR = [100, 50, 0];
exports.SINGLE_WIDTH = 3; // pixels
exports.SINGLE_DURATION = 1000; // msg
exports.SINGLE_INCLUDE_BACKWARDS = false;
exports.NODE_TO_STRIPS_MAP_NAME = "node-to-strips-map.json";
exports.NODE_TO_CAMERA_MAP_NAME = "node-to-camera-map.json";
function loadStripsMap() {
    return loadJson(exports.NODE_TO_STRIPS_MAP_NAME);
}
exports.loadStripsMap = loadStripsMap;
function loadCameraMap() {
    return loadJson(exports.NODE_TO_CAMERA_MAP_NAME);
}
exports.loadCameraMap = loadCameraMap;
function loadJson(name) {
    return JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, name)).toString());
}
exports.loadJson = loadJson;
function saveJson(name, object) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = JSON.stringify(object);
        let answer = yield (0, calibrate_1.askQuestion)(`Are you sure sure sure you wanna save the following JSON as ${name}?\n` +
            data +
            " (y/n): \n");
        while (answer !== "y" && answer !== "n") {
            answer = yield (0, calibrate_1.askQuestion)("Please enter y or n: ");
        }
        if (answer === "y") {
            (0, fs_1.writeFileSync)((0, path_1.join)(__dirname, name), data);
            console.log("file has been saved");
            return;
        }
        return;
    });
}
exports.saveJson = saveJson;
