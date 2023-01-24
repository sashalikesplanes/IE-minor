"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchEvents = void 0;
const serialport_1 = require("serialport");
const port = new serialport_1.SerialPort({
    path: "/dev/cu.usbmodem14203",
    baudRate: 9600,
});
function dispatchEvents(event) {
    if (Array.isArray(event)) {
        event.forEach((e) => dispatchEvents(e));
        return;
    }
    port.write(JSON.stringify(event) + "\n");
}
exports.dispatchEvents = dispatchEvents;
