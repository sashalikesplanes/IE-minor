"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const behaviour_handlers_1 = require("./behaviour-handlers");
const config_1 = require("./config");
const serial_1 = require("./serial");
const colors = [
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
];
const messageBuilder = () => {
    const messages = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
        type: "message",
        color: colors[i],
        message_width: 10,
        pace: 20,
        start_idx: 0,
        end_idx: config_1.DOUBLE_LENGTH_STRIP_INDECES.includes(i) ? 199 : 99,
        strip_idx: i,
        start_node: 0,
        end_node: 1,
        next: {
            type: "message",
            color: colors[i],
            message_width: 10,
            pace: 20,
            start_idx: config_1.DOUBLE_LENGTH_STRIP_INDECES.includes(i) ? 199 : 99,
            end_idx: 0,
            strip_idx: i,
            start_node: 0,
            end_node: 1,
            next: null
        }
    }));
    return messages;
};
const handler = (0, behaviour_handlers_1.createMessageBehaviourHandler)("0-8");
(0, serial_1.dispatchEvents)({ type: "clear", next: null });
function setTimeoutAndDispatchEvents() {
    setTimeout(() => {
        // const message = JSON.parse(`{"type":"constant","color":[100,100,100],"duration":1000000,"fadein_duration":0,"fadeout_duration":0,"fade_power":1,"next":null,"pixels":[{"strip_idx":4,"pixel_idx":147},{"strip_idx":4,"pixel_idx":148},{"strip_idx":4,"pixel_idx":149}]}`)
        // dispatchEvents([message]);
        // @ts-ignore
        handler([0, 8]);
        setTimeoutAndDispatchEvents();
    }, 1000);
}
setTimeoutAndDispatchEvents();
