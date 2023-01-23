import { timer } from "rxjs";
import { NODE_COLOR, NODE_SOLID_DURATION, NODE_SOLID_WIDTH } from "./config";
import { mapNodeListToSolidEvents } from "./mappers";
import { dispatchEvents } from "./serial";
import { loadStripsMap } from "./utils";

dispatchEvents({ type: "clear" });

const SAVE_RESULTS = true;
const SILENT = false;

// const detectNodeList$ = detection$Factory(SAVE_RESULTS, SILENT).pipe(
//   bufferTime(DETECTION_BUFFER_TIME_SPAN, DETECTION_BUFFER_CREATION_INTERVAL),
//   map(mapDetectionsToNodeList),
//   share()
// );

// singleBehaviourHandlers.forEach((handler) => {
//   detectNodeList$.subscribe(handler);
// });

// const detectedNodePair$ = detectNodeList$.pipe(
//   mergeMap((nodeList) => {
//     // create a list of all possible pairs
//     if (nodeList.length < 2) {
//       return [];
//     }

//     const pairs = nodeList.flatMap((node, idx) => {
//       return nodeList.slice(idx + 1).map((otherNode) => {
//         if (node < otherNode) {
//           return [node, otherNode];
//         } else {
//           return [otherNode, node];
//         }
//       });
//     });
//     return from(pairs);
//   }),
//   share()
// );

// messageBehaviourHandlers.forEach((handler) => {
//   detectedNodePair$.subscribe(handler);
// });

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
