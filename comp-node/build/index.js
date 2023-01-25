"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const behaviour_handlers_1 = require("./behaviour-handlers");
const config_1 = require("./config");
const freenect_1 = require("./freenect");
const mappers_1 = require("./mappers");
const serial_1 = require("./serial");
const sounds_1 = require("./sounds");
const utils_1 = require("./utils");
// Clear all current behaviours
(0, serial_1.dispatchEvents)({ type: "clear" });
// Start ambient sound
(0, sounds_1.playSound)(config_1.AMBIENT_SOUND_REL_PATH, true, config_1.AMBIENT_VOLUME);
(0, sounds_1.playNarration)();
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
(0, utils_1.loadStripsMap)().forEach((_, nodeIdx) => {
    const randomInterval = config_1.NODE_SOLID_MIN_INTERVAL + Math.random() * config_1.NODE_SOLID_MAX_INTERVAL;
    // for each interval, create a random event
    const event = (0, mappers_1.mapNodeListToConstantEvents)(nodeIdx, config_1.NODE_COLOR, randomInterval, config_1.NODE_SOLID_WIDTH, config_1.NODE_SOLID_FADE_DURATION, config_1.NODE_SOLID_FADE_DURATION, config_1.MESSAGE_FADE_POWER);
    (0, rxjs_1.timer)(0, randomInterval).subscribe(() => (0, serial_1.dispatchEvents)(event));
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
const detectNodeList$ = (0, freenect_1.detection$Factory)(config_1.SILENT_DETECTIONS).pipe((0, rxjs_1.bufferTime)(config_1.DETECTION_BUFFER_TIME_SPAN, config_1.DETECTION_BUFFER_CREATION_INTERVAL), (0, rxjs_1.map)(mappers_1.mapDetectionsToNodeList), (0, rxjs_1.share)());
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
