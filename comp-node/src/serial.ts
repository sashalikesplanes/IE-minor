import { SerialPort } from "serialport";
import { EventUnion } from "./events";

const getSerialPorts = () => {
  return [0,1,2,3].map((i) => {
  return new SerialPort({
    path: `/dev/tty.usbmodemIB_${i}_1`,
    baudRate: 115200,
  });
  });
};

const ports = getSerialPorts();

const messages = [];

export async function dispatchEvents(event: EventUnion | EventUnion[]) {
  if (Array.isArray(event)) {
    event.forEach((e) => dispatchEvents(e));
    return;
  }

  if (event.type === "constant" && event.pixels.length === 0) {
    return;
  }

  const message = JSON.stringify(event) + "\n";

  messages.push(message);
}

setInterval(() => {
  if (messages.length === 0) {
    return;
  }

  const message = messages.shift();

  console.log(message);

  ports.forEach((port) => {
    port.write(message);
  });
}, 3)
