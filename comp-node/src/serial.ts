import { SerialPort } from "serialport";
import { EventUnion } from "./events";

const getSerialPort = async () => {
  return new SerialPort({
    path: "/dev/ttyACM0",
    baudRate: 115200,
  });
};

const port = getSerialPort();

export async function dispatchEvents(event: EventUnion | EventUnion[]) {
  if (Array.isArray(event)) {
    event.forEach((e) => dispatchEvents(e));
    return;
  }

  (await port).write(`${JSON.stringify(event)}\n`);
}
