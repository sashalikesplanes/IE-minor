"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serial_1 = require("./serial");
const messageBuilder = () => {
    const initial = {
        type: "message",
        color: [100, 0, 0],
        message_width: 5,
        pace: 0.01,
        start_idx: 49,
        end_idx: 0,
        strip_idx: 0,
        start_node: 0,
        end_node: 1,
        next: {
            type: "message",
            color: [0, 100, 0],
            message_width: 5,
            pace: 0.01,
            start_idx: 0,
            end_idx: 49,
            strip_idx: 0,
            start_node: 0,
            end_node: 1,
            next: {
                type: "message",
                color: [0, 0, 100],
                message_width: 5,
                pace: 0.01,
                start_idx: 49,
                end_idx: 0,
                strip_idx: 0,
                start_node: 0,
                end_node: 1,
                next: {
                    type: "message",
                    color: [100, 100, 0],
                    message_width: 5,
                    pace: 0.01,
                    start_idx: 0,
                    end_idx: 49,
                    strip_idx: 0,
                    start_node: 0,
                    end_node: 1,
                    next: {
                        type: "message",
                        color: [100, 0, 100],
                        message_width: 5,
                        pace: 0.01,
                        start_idx: 49,
                        end_idx: 0,
                        strip_idx: 0,
                        start_node: 0,
                        end_node: 1,
                        next: {
                            type: "message",
                            color: [0, 100, 100],
                            message_width: 5,
                            pace: 0.01,
                            start_idx: 0,
                            end_idx: 49,
                            strip_idx: 0,
                            start_node: 0,
                            end_node: 1,
                            next: {
                                type: "message",
                                color: [100, 100, 100],
                                message_width: 5,
                                pace: 0.01,
                                start_idx: 49,
                                end_idx: 0,
                                strip_idx: 0,
                                start_node: 0,
                                end_node: 1,
                                next: null
                            }
                        }
                    }
                }
            }
        }
    };
    console.log(JSON.stringify(initial));
    return initial;
};
messageBuilder();
(0, serial_1.dispatchEvents)(messageBuilder());
