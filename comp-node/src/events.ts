import { StripSegment } from "./path-finding";

export interface AbstractEvent {
  type: string;
  next: AbstractEvent | null;
}

export type MessageEvent = {
  type: "message";
  color: number[];
  message_width: number;
  pace: number;
  next: MessageEvent | null;
} & StripSegment;

export type ClearEvent = {
  type: "clear";
};

export function linkEvents(events: MessageEvent[]): MessageEvent;
export function linkEvents(events: AbstractEvent[]): AbstractEvent {
  events.reduce((prev, curr) => {
    prev.next = curr;
    return curr;
  });

  return events[0];
}

export function getMessageDurationInMs(message: MessageEvent) {
  return (
    ((Math.abs(message.end_idx - message.start_idx) +
      1 +
      message.message_width / 2) /
      message.pace) *
    1000
  );
}

export function getLinkedMessagesDurationInMs(message: MessageEvent | null) {
  let duration = 0;
  while (message) {
    duration += getMessageDurationInMs(message);
    message = message.next;
  }
  return duration;
}

export function reverseMessage(message: MessageEvent): MessageEvent {
  return {
    ...message,
    start_idx: message.end_idx,
    end_idx: message.start_idx,
    next: null,
  };
}

const TEST_PACE = 20;
export const message1: MessageEvent = {
  type: "message",
  start_node: 0,
  end_node: 1,
  strip_idx: 0,
  start_idx: 40,
  end_idx: 46,
  color: [255, 0, 0],
  message_width: 10,
  pace: TEST_PACE,
  next: null,
};

export const message2: MessageEvent = {
  type: "message",
  start_node: 0,
  end_node: 1,
  strip_idx: 1,
  start_idx: 26,
  end_idx: 17,
  color: [255, 0, 0],
  message_width: 10,
  pace: TEST_PACE,
  next: null,
};

export const message3: MessageEvent = {
  type: "message",
  start_node: 0,
  end_node: 1,
  strip_idx: 3,
  start_idx: 74,
  end_idx: 68,
  color: [255, 0, 0],
  message_width: 10,
  pace: TEST_PACE,
  next: null,
};
