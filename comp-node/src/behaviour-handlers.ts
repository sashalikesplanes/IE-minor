import {
  MESSAGE_COLOR,
  MESSAGE_INCLUDE_BACKWARDS,
  MESSAGE_PACE,
  MESSAGE_WIDTH,
  SINGLE_COLOR,
  SINGLE_DURATION,
  SINGLE_INCLUDE_BACKWARDS,
  SINGLE_WIDTH,
} from "./config";
import { getLinkedMessagesDurationInMs } from "./events";
import {
  mapNodesToEventsWithDuration,
  mapNodesToEventsWithPace,
} from "./mappers";
import { edges } from "./path-finding";
import { dispatchEvents } from "./serial";
import { loadStripsMap } from "./utils";

export const singleBehaviourHandlers = new Map<
  number,
  (nodeList: number[]) => void
>();

loadStripsMap().forEach((_, nodeIdx) => {
  singleBehaviourHandlers.set(nodeIdx, createSingleBehaviourHandler(nodeIdx));
});

export const messageBehaviourHandlers = new Map<
  string,
  (nodePair: number[]) => void
>();

// for each pair of nodes, create a handler
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

console.log(messageBehaviourHandlers.keys());

function createMessageBehaviourHandler(key: string) {
  // create all the events to be dispatched and record the duration
  const startNode = parseInt(key.split("-")[0]);
  const endNode = parseInt(key.split("-")[1]);
  const firstEvent = mapNodesToEventsWithPace(
    startNode,
    endNode,
    MESSAGE_COLOR,
    MESSAGE_WIDTH,
    MESSAGE_PACE,
    MESSAGE_INCLUDE_BACKWARDS
  );

  const totalDuration = getLinkedMessagesDurationInMs(firstEvent);

  let lastDispatchTime = new Date().getTime() - totalDuration - 1;
  return function (nodePair: number[]): void {
    const currentKey =
      nodePair[0] < nodePair[1]
        ? `${nodePair[0]}-${nodePair[1]}`
        : `${nodePair[1]}-${nodePair[0]}`;
    if (currentKey !== key) return;
    if (new Date().getTime() - lastDispatchTime < totalDuration) return;
    lastDispatchTime = new Date().getTime();
    dispatchEvents(firstEvent);
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
      SINGLE_DURATION,
      SINGLE_INCLUDE_BACKWARDS
    )
  );

  let lastDispatchTime = new Date().getTime() - SINGLE_DURATION - 1;

  return function (nodeList: number[]): void {
    if (nodeList.length !== 1 || nodeList[0] !== nodeIdx) return;
    console.warn("this is the single behaviour handler", nodeList);
    if (new Date().getTime() - lastDispatchTime < SINGLE_DURATION) return;
    lastDispatchTime = new Date().getTime();
    console.warn("dispatching events", events);
    dispatchEvents(events);
  };
}
