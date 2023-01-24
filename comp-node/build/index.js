"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const behaviour_handlers_1 = require("./behaviour-handlers");
const config_1 = require("./config");
const freenect_1 = require("./freenect");
const mappers_1 = require("./mappers");
const serial_1 = require("./serial");
const utils_1 = require("./utils");
// Clear all current behaviours
(0, serial_1.dispatchEvents)({ type: "clear" });
// Create the constantly on behaviour
(0, rxjs_1.timer)(0, config_1.NODE_SOLID_DURATION).subscribe(() => {
    const listOfAllNodes = Array.from(Array((0, utils_1.loadStripsMap)().length).keys());
    (0, mappers_1.mapNodeListToSolidEvents)(listOfAllNodes, config_1.NODE_COLOR, config_1.NODE_SOLID_DURATION, config_1.NODE_SOLID_WIDTH).forEach((event) => {
        (0, serial_1.dispatchEvents)(event);
    });
});
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
