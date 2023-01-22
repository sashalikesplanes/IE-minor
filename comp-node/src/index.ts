import { bufferTime, from, map, mergeMap, share, tap, timer } from "rxjs";
import {
  messageBehaviourHandlers,
  singleBehaviourHandlers,
} from "./behaviour-handlers";
import {
  DETECTION_BUFFER_CREATION_INTERVAL,
  DETECTION_BUFFER_TIME_SPAN,
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

const SAVE_RESULTS = false;
const SILENT = false;

const detectNodeList$ = detection$Factory(SAVE_RESULTS, SILENT).pipe(
  bufferTime(DETECTION_BUFFER_TIME_SPAN, DETECTION_BUFFER_CREATION_INTERVAL),
  map(mapDetectionsToNodeList),
  share()
);

singleBehaviourHandlers.forEach((handler) => {
  detectNodeList$.subscribe(handler);
});

const detectedNodePair$ = detectNodeList$.pipe(
  mergeMap((nodeList) => {
    // create a list of all possible pairs
    if (nodeList.length < 2) {
      return [];
    }

    const pairs = [...nodeList].flatMap((node, idx) => {
      return [...nodeList].slice(idx + 1).map((otherNode) => {
        if (node < otherNode) {
          return [node, otherNode];
        } else {
          return [otherNode, node];
        }
      });
    });
    return from(pairs);
  }),
  tap((pairs) => {
    console.warn("pairs in pair$", pairs);
  }),
  share()
);

messageBehaviourHandlers.forEach((handler) => {
  detectedNodePair$.subscribe(handler);
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
