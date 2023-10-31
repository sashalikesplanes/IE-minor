import { SerialPort } from "serialport";
import { LOVE_COLOR } from "./config";
import { EventUnion } from "./events";
import { mikeState } from './state';


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
  console.log("dispatching events")
  if (Array.isArray(event)) {
    event.forEach((e) => dispatchEvents(e));
    return;
  }

  if (event.type === "constant" && event.pixels.length === 0) {
    return;
  }

  if (mikeState.isInLove) {
    event = JSON.parse(JSON.stringify(event));
    // @ts-ignore, we know it is not an array
    event.color = LOVE_COLOR;
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
    port.write(message, (err) => {
      if (err) {
        console.error(err);
      }
    });
    port.on("error", (err) => {
      console.error(err);
    })
  });
}, 5)
