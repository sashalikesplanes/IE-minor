import { SerialPort } from "serialport";
import { AbstractEvent, MessageEvent } from "./events";

const port = new SerialPort({
  path: "/dev/cu.usbmodem14203",
  baudRate: 9600,
});

export function dispatchEvent(event: MessageEvent) {
  port.write(JSON.stringify(event) + "\n");
}
