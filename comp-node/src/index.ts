import { bufferTime, map, share, timer } from "rxjs";
import { singleBehaviourHandlers } from "./behaviour-handlers";
import {
  DETECTION_BUFFER_TIME,
  nodeToStripsMap,
  NODE_COLOR,
  NODE_SOLID_DURATION,
  NODE_SOLID_WIDTH,
} from "./config";
import { detection$Factory } from "./freenect";
import {
  mapDetectionsToNodeList,
  mapNodeListToSolidEvents,
} from "./mapNodeListToSolidEvents";
import { dispatchEvents } from "./serial";

dispatchEvents({ type: "clear" });

const SAVE_RESULTS = true;

const detection$ = detection$Factory(SAVE_RESULTS, false).pipe(
  bufferTime(DETECTION_BUFFER_TIME),
  map(mapDetectionsToNodeList),
  share()
);

singleBehaviourHandlers.forEach((handler) => {
  detection$.subscribe(handler);
});

// Create the constantly on behaviour
timer(0, NODE_SOLID_DURATION).subscribe(() => {
  const listOfAllNodes = Array.from(Array(nodeToStripsMap.length).keys());
  mapNodeListToSolidEvents(
    listOfAllNodes,
    NODE_COLOR,
    NODE_SOLID_DURATION,
    NODE_SOLID_WIDTH
  ).forEach((event) => {
    dispatchEvents(event);
  });
});

// TESTS FOR PATH FINDING

// let firstLinkedEvent = nodesToEvent(0, 8);
// let firstLinkedEventDuration = getLinkedMessagesDurationInMs(firstLinkedEvent);

// dispatchEvents({ type: "clear" });
// interval(firstLinkedEventDuration).subscribe(() => {
//   dispatchEvents(firstLinkedEvent);
// });

// const firstLinkedEvent2 = nodesToEvent(3, 14);
// console.log("first linked event", firstLinkedEvent);
// const firstLinkedEventDuration2 =
//   getLinkedMessagesDurationInMs(firstLinkedEvent);
// console.log(firstLinkedEventDuration2);

// interval(firstLinkedEventDuration2).subscribe(() => {
//   dispatchEvent(firstLinkedEvent2);
// });
// firstLinkedEvent = nodesToEvent(15, 2);
// console.log("first linked event", firstLinkedEvent);
// firstLinkedEventDuration = getLinkedMessagesDurationInMs(firstLinkedEvent);
// console.log(firstLinkedEventDuration);

// interval(firstLinkedEventDuration).subscribe(() => {
//   dispatchEvent(firstLinkedEvent);
// });
