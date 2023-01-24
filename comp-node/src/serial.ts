import { SerialPort } from "serialport";
import { EventUnion } from "./events";

const getSerialPort = async () => {
  const portList = await SerialPort.list();
  const portNumber = portList
    .filter((p) => p.path.includes("tty.usbmodem"))
    .filter((p) => p.path[p.path.length - 1] === "3")[0]
    .path.split("tty.usbmodem")[1];

  console.log(portNumber);
  return new SerialPort({
    path: "/dev/cu.usbmodem" + portNumber,
    baudRate: 9600,
  });
};

const port = getSerialPort();

export async function dispatchEvents(event: EventUnion | EventUnion[]) {
  if (Array.isArray(event)) {
    event.forEach((e) => dispatchEvents(e));
    return;
  }

  (await port).write(JSON.stringify(event) + "\n");
}
