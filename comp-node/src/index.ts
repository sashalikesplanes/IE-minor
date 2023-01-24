import { bufferTime, from, map, mergeMap, share, timer } from "rxjs";
import {
  messageBehaviourHandlers,
  singleBehaviourHandlers,
} from "./behaviour-handlers";
import {
  DETECTION_BUFFER_CREATION_INTERVAL,
  DETECTION_BUFFER_TIME_SPAN,
  NODE_COLOR,
  NODE_SOLID_DURATION,
  NODE_SOLID_WIDTH,
  SILENT_DETECTIONS,
} from "./config";
import { detection$Factory } from "./freenect";
import { mapDetectionsToNodeList, mapNodeListToSolidEvents } from "./mappers";
import { dispatchEvents } from "./serial";
import { loadStripsMap } from "./utils";

// Clear all current behaviours
dispatchEvents({ type: "clear" });

// Start ambient sound
// playSound(AMBIENT_SOUND_REL_PATH, true);

// Create the constantly on behaviour
timer(0, NODE_SOLID_DURATION).subscribe(() => {
  const listOfAllNodes = Array.from(Array(loadStripsMap().length).keys());
  mapNodeListToSolidEvents(
    listOfAllNodes,
    NODE_COLOR,
    NODE_SOLID_DURATION,
    NODE_SOLID_WIDTH
  ).forEach((event) => {
    dispatchEvents(event);
  });
});

// Get the buffered list of unique detections
const detectNodeList$ = detection$Factory(SILENT_DETECTIONS).pipe(
  bufferTime(DETECTION_BUFFER_TIME_SPAN, DETECTION_BUFFER_CREATION_INTERVAL),
  map(mapDetectionsToNodeList),
  share()
);

// Create the single node behaviour
singleBehaviourHandlers.forEach((handler) => {
  detectNodeList$.subscribe(handler);
});

// Convert the list of nodes to a list of all node pairs
const detectedNodePair$ = detectNodeList$.pipe(
  mergeMap((nodeList) => {
    // create a list of all possible pairs
    if (nodeList.length < 2) {
      return [];
    }

    const pairs = nodeList.flatMap((node, idx) => {
      return nodeList.slice(idx + 1).map((otherNode) => {
        if (node < otherNode) {
          return [node, otherNode];
        } else {
          return [otherNode, node];
        }
      });
    });
    return from(pairs);
  }),
  share()
);

// Create the message behaviour
messageBehaviourHandlers.forEach((handler) => {
  detectedNodePair$.subscribe(handler);
});
