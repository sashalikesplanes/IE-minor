"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const serial_1 = require("./serial");
exports.app = require('express')();
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const state_1 = require("./state");
exports.app.use((0, cors_1.default)());
exports.app.get('/love', (_, res) => {
    state_1.mikeState.isInLove = true;
    setTimeout(() => {
        state_1.mikeState.isInLove = false;
    }, config_1.LOVE_DURATION);
    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((strip) => {
        (0, serial_1.dispatchEvents)({
            type: 'message',
            start_idx: 0,
            end_idx: 100,
            strip_idx: strip,
            color: config_1.LOVE_COLOR,
            message_width: config_1.LOVE_WIDTH,
            pace: config_1.LOVE_PACE,
            start_node: 0,
            end_node: 0,
            next: {
                type: 'message',
                start_idx: 100,
                end_idx: 0,
                strip_idx: strip,
                color: config_1.LOVE_COLOR,
                message_width: config_1.LOVE_WIDTH,
                pace: config_1.LOVE_PACE,
                start_node: 0,
                end_node: 0,
                next: null
            }
        });
        // Check if the request body is an array of numbers
    });
    res.status(200).send('Love recieved');
});
