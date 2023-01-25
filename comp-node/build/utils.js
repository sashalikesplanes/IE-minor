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
exports.saveJson = exports.loadCameraMap = exports.loadStripsMap = exports.loadJson = exports.askQuestion = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const readline_1 = __importDefault(require("readline"));
const config_1 = require("./config");
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
function loadJson(name) {
    return JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, name)).toString());
}
exports.loadJson = loadJson;
const loadStripsMap = () => {
    return loadJson(config_1.NODE_TO_STRIPS_MAP_REL_PATH);
};
exports.loadStripsMap = loadStripsMap;
function loadCameraMap() {
    return loadJson(config_1.NODE_TO_CAMERA_MAP_REL_PATH);
}
exports.loadCameraMap = loadCameraMap;
function saveJson(name, object) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = JSON.stringify(object);
        let answer = yield askQuestion(`Are you sure sure sure you wanna save the following JSON as ${name}?\n` +
            data +
            " (y/n): \n");
        while (answer !== "y" && answer !== "n") {
            answer = yield askQuestion("Please enter y or n: ");
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
