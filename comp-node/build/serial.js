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
const getSerialPort = () => __awaiter(void 0, void 0, void 0, function* () {
    const portList = yield serialport_1.SerialPort.list();
    const portNumber = portList
        .filter((p) => p.path.includes("tty.usbmodem"))
        .filter((p) => p.path[p.path.length - 1] === "3")[0]
        .path.split("tty.usbmodem")[1];
    console.log(portNumber);
    return new serialport_1.SerialPort({
        path: "/dev/cu.usbmodem" + portNumber,
        baudRate: 9600,
    });
});
const port = getSerialPort();
function dispatchEvents(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Array.isArray(event)) {
            event.forEach((e) => dispatchEvents(e));
            return;
        }
        (yield port).write(JSON.stringify(event) + "\n");
    });
}
exports.dispatchEvents = dispatchEvents;
