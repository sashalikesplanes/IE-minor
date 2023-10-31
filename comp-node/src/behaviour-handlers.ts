import {
  MESSAGE_COLOR,
  MESSAGE_DURATION_DIVIDER,
  MESSAGE_CONSTANT_DURATION,
  MESSAGE_FADE_DURATION,
  MESSAGE_FADE_IN_TIMEOUT_MULTIPLIER,
  MESSAGE_FADE_POWER,
  MESSAGE_INCLUDE_BACKWARDS,
  MESSAGE_PACE,
  MESSAGE_SOUND_REL_PATH,
  MESSAGE_VOLUME,
  MESSAGE_WIDTH,
  NODE_COLOR,
  NODE_SOLID_WIDTH,
  SINGLE_COLOR,
  SINGLE_INCLUDE_BACKWARDS,
  SINGLE_LED_DURATION,
  SINGLE_SOUND_MESSAGES,
  SINGLE_SOUND_REL_PATH,
  SINGLE_VOLUME,
  SINGLE_WIDTH,
  SINGLE_PULSE_MULTIPLIER,
  MESSAGE_MULTIPLIER,
} from "./config";
import { getLinkedMessagesDurationInMs } from "./events";
import { getSegments } from "./path-finding";
import {
  mapNodeListToConstantEvents,
  mapNodesToEventsWithDuration,
  mapNodesToEventsWithPace,
} from "./mappers";
import { edges } from "./path-finding";
import { dispatchEvents } from "./serial";
import { playSound, playSoundPerEvent } from "./sounds";
import { loadStripsMap } from "./utils";

export const singleBehaviourHandlers = new Map<
  number,
  (nodeList: number[]) => void
>();

// For each node, create a handler
loadStripsMap().forEach((_, nodeIdx) => {
  singleBehaviourHandlers.set(nodeIdx, createSingleBehaviourHandler(nodeIdx));
});

export const messageBehaviourHandlers = new Map<
  string,
  (nodePair: number[]) => void
>();

// For each pair of nodes, create a handler
loadStripsMap().forEach((_, nodeIdx) => {
  loadStripsMap().forEach((_, otherNodeIdx) => {
    if (otherNodeIdx <= nodeIdx) return;
    const key =
      nodeIdx < otherNodeIdx
        ? `${nodeIdx}-${otherNodeIdx}`
        : `${otherNodeIdx}-${nodeIdx}`;
    messageBehaviourHandlers.set(key, createMessageBehaviourHandler(key));
  });
});

export function createMessageBehaviourHandler(key: string) {
  // create all the events to be dispatched and record the duration
  const startNode = parseInt(key.split("-")[0]);
  const endNode = parseInt(key.split("-")[1]);
  const firstMessageEvent = mapNodesToEventsWithPace(
    // Subsequent are linked
    startNode,
    endNode,
    MESSAGE_COLOR,
    MESSAGE_WIDTH,
    MESSAGE_PACE,
    MESSAGE_INCLUDE_BACKWARDS
  );

  // playSoundPerEvent(firstMessageEvent, MESSAGE_SOUND_REL_PATH);

  const totalDurationMs = // MESSAGE_CONSTANT_DURATION;
    getLinkedMessagesDurationInMs(firstMessageEvent) / MESSAGE_DURATION_DIVIDER;

  const fadeInMessageEvents = mapNodeListToConstantEvents(
    [startNode, endNode],
    MESSAGE_COLOR,
    totalDurationMs / 1000,
    NODE_SOLID_WIDTH,
    MESSAGE_FADE_DURATION,
    0,
    MESSAGE_FADE_POWER
  );

  const nodes = getSegments(startNode, endNode).flatMap((segment) => [
    segment.start_node,
    segment.end_node,
  ]);
  const nodeSet = new Set(nodes);
  nodeSet.delete(startNode);
  nodeSet.delete(endNode);
  // get all nodes apart from start end
  const middleEvents = mapNodeListToConstantEvents(
    [...nodeSet],
    NODE_COLOR,
    totalDurationMs / 1000,
    NODE_SOLID_WIDTH,
    MESSAGE_FADE_DURATION,
    0,
    MESSAGE_FADE_POWER
  );

  mapNodeListToConstantEvents(
    [startNode, endNode],
    MESSAGE_COLOR,
    MESSAGE_FADE_DURATION,
    NODE_SOLID_WIDTH,
    0,
    MESSAGE_FADE_DURATION,
    MESSAGE_FADE_POWER
  ).forEach((event, eventIdx) => {
    fadeInMessageEvents[eventIdx].next = event;
  });

  let lastDispatchTime = new Date().getTime() - totalDurationMs - 1;

  return function(nodePair: number[]): void {
    const currentKey =
      nodePair[0] < nodePair[1]
        ? `${nodePair[0]}-${nodePair[1]}`
        : `${nodePair[1]}-${nodePair[0]}`;
    if (currentKey !== key) return;
    if (new Date().getTime() - lastDispatchTime < totalDurationMs / MESSAGE_MULTIPLIER) {
      return;
    }
    if (
      new Date().getTime() - lastDispatchTime >
      totalDurationMs * MESSAGE_FADE_IN_TIMEOUT_MULTIPLIER
    ) {
      dispatchEvents([
        ...fadeInMessageEvents,
        firstMessageEvent,
        ...middleEvents,
      ]);
    } else {
      dispatchEvents([
        ...fadeInMessageEvents.map((e) => ({ ...e, fadein_duration: 0 })),
        firstMessageEvent,
        ...middleEvents,
      ]);
    }

    playSoundPerEvent(firstMessageEvent, MESSAGE_SOUND_REL_PATH, MESSAGE_VOLUME);
    lastDispatchTime = new Date().getTime();
  };
}

function createSingleBehaviourHandler(
  nodeIdx: number
): (nodeList: number[]) => void {
  const connectedEdges = edges.filter((edge) => edge.start_node === nodeIdx);
  const events = connectedEdges.map((edge) =>
    mapNodesToEventsWithDuration(
      nodeIdx,
      edge.end_node,
      SINGLE_COLOR,
      SINGLE_WIDTH,
      SINGLE_LED_DURATION,
      SINGLE_INCLUDE_BACKWARDS
    )
  );

  let lastMessageTime = new Date().getTime() - SINGLE_LED_DURATION - 1;
  let lastSoundTime =
    new Date().getTime() - SINGLE_LED_DURATION * SINGLE_SOUND_MESSAGES - 1;

  return function(nodeList: number[]): void {
    if (nodeList.length !== 1 || nodeList[0] !== nodeIdx) return;

    if (
      new Date().getTime() - lastSoundTime >
      SINGLE_LED_DURATION * SINGLE_SOUND_MESSAGES
    ) {
      lastSoundTime = new Date().getTime();
      playSound(SINGLE_SOUND_REL_PATH, false, SINGLE_VOLUME);
    }

    if (new Date().getTime() - lastMessageTime > SINGLE_LED_DURATION / SINGLE_PULSE_MULTIPLIER) {
      lastMessageTime = new Date().getTime();
      dispatchEvents(events);
    }
  };
}
