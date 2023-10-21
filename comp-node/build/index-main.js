"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const behaviour_handlers_1 = require("./behaviour-handlers");
const config_1 = require("./config");
const mappers_1 = require("./mappers");
const serial_1 = require("./serial");
const utils_1 = require("./utils");
// Clear all current behaviours
(0, serial_1.dispatchEvents)({ type: "clear", next: null });
// Start ambient sound
// playSound(AMBIENT_SOUND_REL_PATH, true, AMBIENT_VOLUME);
// playNarration();
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
//   timer(0, randomInterval).subscribe(() => dispatchEvents(event));
// });
// Create the constantly on behaviour
(0, rxjs_1.timer)(0, config_1.NODE_SOLID_DURATION).subscribe(() => {
    // Change these to be pulsing at random intervals
    const listOfAllNodes = Array.from(Array((0, utils_1.loadStripsMap)().length).keys());
    (0, mappers_1.mapNodeListToConstantEvents)(listOfAllNodes, config_1.NODE_COLOR, config_1.NODE_SOLID_DURATION, config_1.NODE_SOLID_WIDTH).forEach((event) => {
        // change these to be pulsing at random intervals
        (0, serial_1.dispatchEvents)(event);
    });
});
// setup an express server to listen for detections
const detectNodeList$ = new rxjs_1.Observable((subscriber) => {
    // Regularly push random integers into the observable
}).pipe((0, rxjs_1.share)());
// const detectNodeList$ = detection$Factory(SILENT_DETECTIONS).pipe(
//   bufferTime(DETECTION_BUFFER_TIME_SPAN, DETECTION_BUFFER_CREATION_INTERVAL),
//   map(mapDetectionsToNodeList),
//   share()
// );
// Create the single node behaviour
behaviour_handlers_1.singleBehaviourHandlers.forEach((handler) => {
    detectNodeList$.subscribe(handler);
});
// Convert the list of nodes to a list of all node pairs
const detectedNodePair$ = detectNodeList$.pipe((0, rxjs_1.mergeMap)((nodeList) => {
    // create a list of all possible pairs
    if (nodeList.length < 2) {
        return [];
    }
    const pairs = nodeList.flatMap((node, idx) => {
        return nodeList.slice(idx + 1).map((otherNode) => {
            if (node < otherNode) {
                return [node, otherNode];
            }
            else {
                return [otherNode, node];
            }
        });
    });
    return (0, rxjs_1.from)(pairs);
}), (0, rxjs_1.share)());
// Create the message behaviour
behaviour_handlers_1.messageBehaviourHandlers.forEach((handler) => {
    detectedNodePair$.subscribe(handler);
});
