import { SerialPort } from "serialport";
import { EventUnion } from "./events";

const port = new SerialPort({
  path: "/dev/cu.usbmodem141103",
  baudRate: 9600,
});

export function dispatchEvents(event: EventUnion | EventUnion[]) {
  if (Array.isArray(event)) {
    event.forEach((e) => dispatchEvents(e));
    return;
  }
  port.write(JSON.stringify(event) + "\n");
}
