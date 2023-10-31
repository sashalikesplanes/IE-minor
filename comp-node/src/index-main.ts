import { randomInt } from "node:crypto";
import { Observable, from, interval, map, mergeMap, share, tap, timer, bufferTime } from "rxjs";
import {
  messageBehaviourHandlers,
  singleBehaviourHandlers,
} from "./behaviour-handlers";
import {
  DETECTION_BUFFER_TIME_SPAN,
  DETECTION_BUFFER_CREATION_INTERVAL,
  MESSAGE_FADE_POWER,
  NODE_COLOR,
  NODE_SOLID_DURATION,
  NODE_SOLID_FADE_DURATION,
  NODE_SOLID_MAX_INTERVAL,
  NODE_SOLID_MIN_INTERVAL,
  NODE_SOLID_WIDTH,
  SILENT_DETECTIONS,
  AMBIENT_SOUND_REL_PATH,
  AMBIENT_VOLUME,
  HEARTBEAT_LOOP_DURATION,
  HEARTBEAT_VOLUME,
  HEARTBEAT_DURATION,
  HEARTBEAT_SOUND_REL_PATH,
  TIME_MULTIPLIER,
  HEARTBEAT_SOUND_DELAY,
  PLAY_NARRATION,
  LOVE_COLOR,
  LOVE_PACE,
  LOVE_WIDTH,
  LOVE_DURATION,
} from "./config";
import {
  mapDetectionsToNodeList,
  mapNodeListToConstantEvents,
  mapNodeListToHeatbeatEvents,
} from "./mappers";
import { dispatchEvents } from "./serial";
import { loadStripsMap } from "./utils";
import { detection$Factory } from "./freenect";
import { playNarration, playSound } from "./sounds";

// start the express server
import { app} from "./server";
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});


// Clear all current behaviours
dispatchEvents({ type: "clear", next: null });

// Start ambient sound
playSound(AMBIENT_SOUND_REL_PATH, true, AMBIENT_VOLUME);
if (PLAY_NARRATION)
  playNarration();


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

// loadStripsMap().forEach((_, nodeIdx) => {
//   const randomInterval =
//     NODE_SOLID_MIN_INTERVAL + Math.random() * NODE_SOLID_MAX_INTERVAL;
//   // for each interval, create a random event
//   const event = mapNodeListToConstantEvents(
//     nodeIdx,
//     NODE_COLOR,
//     randomInterval,
//     NODE_SOLID_WIDTH,
//     NODE_SOLID_FADE_DURATION,
//     NODE_SOLID_FADE_DURATION,
//     MESSAGE_FADE_POWER
//   );
//   timer(0, randomInterval).subscribe(() => dispatchEvents(even
// Create the constantly on behaviour
timer(0, HEARTBEAT_LOOP_DURATION * 1000 / TIME_MULTIPLIER).subscribe(() => {
  // Change these to be pulsing at random intervals
  // also replay the loop
  setTimeout(() => {
    playSound(HEARTBEAT_SOUND_REL_PATH, false, HEARTBEAT_VOLUME);
  }, HEARTBEAT_SOUND_DELAY * 1000 / TIME_MULTIPLIER);
  const listOfAllNodes = Array.from(Array(loadStripsMap().length).keys());
  const totalEvent = mapNodeListToHeatbeatEvents(
    listOfAllNodes,
    NODE_COLOR,
    NODE_SOLID_WIDTH
  ).reduce((acc, curr) => {
    acc.pixels.push(...curr.pixels);
    return acc;
  });

  dispatchEvents(totalEvent);
});

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
