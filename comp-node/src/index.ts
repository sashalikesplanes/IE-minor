import { DOUBLE_LENGTH_STRIP_INDECES } from "./config";
import { MessageEvent } from "./events";
import { dispatchEvents } from "./serial";

const colors = [
  [100, 100, 100],
  [100, 100, 100],
  [100, 100, 100],
  [100, 100, 100],
  [100, 100, 100],
  [100, 100, 100],
  [100, 100, 100],
  [100, 100, 100],
  [100, 100, 100],
]

const messageBuilder = () => {
  const messages = [0].map((i) => ({
    type: "message",
    color: colors[i],
    message_width: 100,
    pace: 0.01,
    start_idx: 0,
    end_idx: DOUBLE_LENGTH_STRIP_INDECES.includes(i) ? 199 : 99,
    strip_idx: i,
    start_node: 0,
    end_node: 1,
    next: {
      type: "message",
      color: colors[i],
      message_width: 100,
      pace: 0.01,
      start_idx: DOUBLE_LENGTH_STRIP_INDECES.includes(i) ? 199 : 99,
      end_idx: 0,
      strip_idx: i,
      start_node: 0,
      end_node: 1,
      next: null
    }
  }));
  return messages
}


function setTimeoutAndDispatchEvents() {

  setTimeout(() => {
    const message = JSON.parse(`{"type":"constant","color":[100,100,100],"duration":1000000,"fadein_duration":0,"fadeout_duration":0,"fade_power":1,"next":null,"pixels":[{"strip_idx":4,"pixel_idx":147},{"strip_idx":4,"pixel_idx":148},{"strip_idx":4,"pixel_idx":149}]}`)
    // @ts-ignore
    // dispatchEvents(messageBuilder());
    dispatchEvents([message]);
    setTimeoutAndDispatchEvents();
  }, 2000);
}

setTimeoutAndDispatchEvents();
