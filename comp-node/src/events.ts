import { StripSegment } from "./path-finding";

export interface Pixel {
  strip_idx: number;
  pixel_idx: number;
}

export type ConstantEvent = {
  type: "constant";
  color: number[];
  duration: number;
  fadein_duration: number;
  fadeout_duration: number;
  fade_power: number;
  pixels: Pixel[];
  next: null | ConstantEvent;
};

export type HeartbeatEvent = {
  type: "heartbeat";
  color: number[];
  duration: number;
  first_pulse_attack: number;
  first_pulse_decay: number;
  second_pulse_attack: number;
  second_pulse_decay: number;
  loop_duration: number;
  dimness: number;
  pixels: Pixel[];
  next: null;
};

export interface AttackDecayEvent {
  type: "attackdecay";
  color: number[];
  attack_duration: number;
  decay_duration: number;
  smoothing_factor: number;
  strip_idx: number;
  start_idx: number;
  end_idx: number;
}


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
  // Meaningless placeholder
  color?: number[];
  next: null;
};

export type NullEvent = {
  type: "null";
  // Meaningless placeholder
  color?: number[];
  next: null;
};

export type EventUnion = MessageEvent | ClearEvent | ConstantEvent | HeartbeatEvent | NullEvent;

export function linkEvents(events: MessageEvent[]): MessageEvent;
export function linkEvents(events: AbstractEvent[]): AbstractEvent {
  if (events.length === 0) {
    return { type: "null", next: null }
  }
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

export function setPaceForADuration(message: MessageEvent, duration: number) {
  return {
    ...message,
    pace:
      (Math.abs(message.end_idx - message.start_idx) +
        1 +
        message.message_width / 2) /
      (duration / 1000),
  };
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
