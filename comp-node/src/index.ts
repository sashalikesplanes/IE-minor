import { MessageEvent } from "./events";
import { dispatchEvents } from "./serial";

const messageBuilder = () => {
  const initial: MessageEvent = {
    type: "message",
    color: [100, 0, 0],
    message_width: 5,
    pace: 0.01,
    start_idx: 49,
    end_idx: 0,
    strip_idx: 0,
    start_node: 0,
    end_node: 1,
    next: {
      type: "message",
      color: [0, 100, 0],
      message_width: 5,
      pace: 0.01,
      start_idx: 0,
      end_idx: 49,
      strip_idx: 0,
      start_node: 0,
      end_node: 1,
      next: {
        type: "message",
        color: [0, 0, 100],
        message_width: 5,
        pace: 0.01,
        start_idx: 49,
        end_idx: 0,
        strip_idx: 0,
        start_node: 0,
        end_node: 1,
        next: {
          type: "message",
          color: [100, 100, 0],
          message_width: 5,
          pace: 0.01,
          start_idx: 0,
          end_idx: 49,
          strip_idx: 0,
          start_node: 0,
          end_node: 1,
          next: {
            type: "message",
            color: [100, 0, 100],
            message_width: 5,
            pace: 0.01,
            start_idx: 49,
            end_idx: 0,
            strip_idx: 0,
            start_node: 0,
            end_node: 1,
            next: {
              type: "message",
              color: [0, 100, 100],
              message_width: 5,
              pace: 0.01,
              start_idx: 0,
              end_idx: 49,
              strip_idx: 0,
              start_node: 0,
              end_node: 1,
              next: {
                type: "message",
                color: [100, 100, 100],
                message_width: 5,
                pace: 0.01,
                start_idx: 49,
                end_idx: 0,
                strip_idx: 0,
                start_node: 0,
                end_node: 1,
                next: null
              }
            }
          }
        }
      }
    }
  };


  console.log(JSON.stringify(initial));
  return initial;
}

messageBuilder();


dispatchEvents(messageBuilder());
