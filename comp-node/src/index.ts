import { bufferTime, from, map, mergeMap, share, timer } from "rxjs";
import {
  messageBehaviourHandlers,
  singleBehaviourHandlers,
} from "./behaviour-handlers";
import {
  AMBIENT_SOUND_REL_PATH,
  AMBIENT_VOLUME,
  DETECTION_BUFFER_CREATION_INTERVAL,
  DETECTION_BUFFER_TIME_SPAN,
  MESSAGE_FADE_POWER,
  NODE_COLOR,
  NODE_SOLID_FADE_DURATION,
  NODE_SOLID_MAX_INTERVAL,
  NODE_SOLID_MIN_INTERVAL,
  NODE_SOLID_WIDTH,
  SILENT_DETECTIONS,
} from "./config";
import { detection$Factory } from "./freenect";
import {
  mapDetectionsToNodeList,
  mapNodeListToConstantEvents,
} from "./mappers";
import { dispatchEvents } from "./serial";
import { playSound } from "./sounds";
import { loadStripsMap } from "./utils";

// Clear all current behaviours
dispatchEvents({ type: "clear" });

// Start ambient sound
playSound(AMBIENT_SOUND_REL_PATH, true, AMBIENT_VOLUME);

// Too many events for it to keep track
// edges.forEach((edge) => {
//   // for each edge create an infibute rabdin observable
//   const randomInterval =
//     PASSIVE_MESSAGE_MIN_INTERVAL + Math.random() * PASSIVE_MESSAGE_MAX_INTERVAL;
//   range(0, 1000000)
//     .pipe(concatMap((i) => of(i).pipe(delay(randomInterval))))
//     .subscribe(() => {
//       // for each interval, create a random event
//       const event = mapNodesToEventsWithDuration(
//         edge.start_node,
//         edge.end_node,
//         PASSIVE_COLOR,
//         PASSIVE_WIDTH,
//         PASSIVE_MESSAGE_MIN_INTERVAL +
//           Math.random() * PASSIVE_MESSAGE_MAX_INTERVAL,
//         false
//       );
//       dispatchEvents(event);
//     });
// });

loadStripsMap().forEach((_, nodeIdx) => {
  const randomInterval =
    NODE_SOLID_MIN_INTERVAL + Math.random() * NODE_SOLID_MAX_INTERVAL;
  // for each interval, create a random event
  const event = mapNodeListToConstantEvents(
    nodeIdx,
    NODE_COLOR,
    randomInterval,
    NODE_SOLID_WIDTH,
    NODE_SOLID_FADE_DURATION,
    NODE_SOLID_FADE_DURATION,
    MESSAGE_FADE_POWER
  );
  timer(0, randomInterval).subscribe(() => dispatchEvents(event));
});

// Create the constantly on behaviour
// timer(0, NODE_SOLID_DURATION).subscribe(() => {
//   // Change these to be pulsing at random intervals
//   const listOfAllNodes = Array.from(Array(loadStripsMap().length).keys());
//   mapNodeListToConstantEvents(
//     listOfAllNodes,
//     NODE_COLOR,
//     NODE_SOLID_DURATION,
//     NODE_SOLID_WIDTH
//   ).forEach((event) => {
//     // change these to be pulsing at random intervals
//     dispatchEvents(event);
//   });
// });

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
