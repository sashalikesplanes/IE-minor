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
exports.playNarration = exports.playSoundPerEvent = exports.playSound = void 0;
const path_1 = require("path");
const events_1 = require("./events");
function playSound(relativePath, loop, volume) {
    return __awaiter(this, void 0, void 0, function* () {
        do {
            const { playAudioFile } = yield import("audic");
            yield playAudioFile((0, path_1.join)(__dirname, relativePath));
        } while (loop);
        return;
    });
}
exports.playSound = playSound;
function playSoundPerEvent(event, relativePath, volume) {
    return __awaiter(this, void 0, void 0, function* () {
        let durations = [];
        let currentEvent = event;
        while (currentEvent) {
            durations.push((0, events_1.getMessageDurationInMs)(currentEvent));
            currentEvent = currentEvent.next;
        }
        for (let i = 0; i < durations.length; i++) {
            playSound(relativePath, false, volume);
            yield new Promise((resolve) => setTimeout(resolve, durations[i]));
        }
    });
}
exports.playSoundPerEvent = playSoundPerEvent;
function playNarration() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            yield new Promise((resolve) => setTimeout(resolve, 20000));
            yield playSound((0, path_1.join)("..", "assets", "olaf1.1.mp3"), false);
            yield new Promise((resolve) => setTimeout(resolve, 10000));
            yield playSound((0, path_1.join)("..", "assets", "olaf1.2.mp3"), false);
            yield new Promise((resolve) => setTimeout(resolve, 10000));
            yield playSound((0, path_1.join)("..", "assets", "olaf1.3.mp3"), false);
            yield new Promise((resolve) => setTimeout(resolve, 10000));
            yield playSound((0, path_1.join)("..", "assets", "olaf1.4.mp3"), false);
            yield new Promise((resolve) => setTimeout(resolve, 20000));
            yield playSound((0, path_1.join)("..", "assets", "olaf2.1.mp3"), false);
            yield new Promise((resolve) => setTimeout(resolve, 10000));
            yield playSound((0, path_1.join)("..", "assets", "olaf2.2.mp3"), false);
            yield new Promise((resolve) => setTimeout(resolve, 10000));
            yield playSound((0, path_1.join)("..", "assets", "olaf2.3.mp3"), false);
            yield new Promise((resolve) => setTimeout(resolve, 20000));
            yield playSound((0, path_1.join)("..", "assets", "olaf3.1.mp3"), false);
            yield new Promise((resolve) => setTimeout(resolve, 10000));
            yield playSound((0, path_1.join)("..", "assets", "olaf3.2.mp3"), false);
            yield new Promise((resolve) => setTimeout(resolve, 10000));
            yield playSound((0, path_1.join)("..", "assets", "olaf3.3.mp3"), false);
            yield new Promise((resolve) => setTimeout(resolve, 20000));
        }
    });
}
exports.playNarration = playNarration;
