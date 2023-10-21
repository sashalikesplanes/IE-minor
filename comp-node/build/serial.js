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
exports.dispatchEvents = void 0;
const serialport_1 = require("serialport");
const getSerialPorts = () => {
    return [0, 1, 2, 3].map((i) => {
        return new serialport_1.SerialPort({
            path: `/dev/tty.usbmodemIB_${i}_1`,
            baudRate: 115200,
        });
    });
};
const ports = getSerialPorts();
const messages = [];
function dispatchEvents(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Array.isArray(event)) {
            event.forEach((e) => dispatchEvents(e));
            return;
        }
        if (event.type === "constant" && event.pixels.length === 0) {
            return;
        }
        const message = JSON.stringify(event) + "\n";
        messages.push(message);
    });
}
exports.dispatchEvents = dispatchEvents;
setInterval(() => {
    if (messages.length === 0) {
        return;
    }
    const message = messages.shift();
    console.log(message);
    ports.forEach((port) => {
        port.write(message);
    });
}, 3);
