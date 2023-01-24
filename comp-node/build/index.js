"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const behaviour_handlers_1 = require("./behaviour-handlers");
const config_1 = require("./config");
const freenect_1 = require("./freenect");
const mappers_1 = require("./mappers");
const serial_1 = require("./serial");
(0, serial_1.dispatchEvents)({ type: "clear" });
const SAVE_RESULTS = false;
const SILENT = false;
const detectNodeList$ = (0, freenect_1.detection$Factory)(SAVE_RESULTS, SILENT).pipe((0, rxjs_1.bufferTime)(config_1.DETECTION_BUFFER_TIME_SPAN, config_1.DETECTION_BUFFER_CREATION_INTERVAL), (0, rxjs_1.map)(mappers_1.mapDetectionsToNodeList), (0, rxjs_1.share)());
behaviour_handlers_1.singleBehaviourHandlers.forEach((handler) => {
    detectNodeList$.subscribe(handler);
});
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
behaviour_handlers_1.messageBehaviourHandlers.forEach((handler) => {
    detectedNodePair$.subscribe(handler);
});
// Create the constantly on behaviour
(0, rxjs_1.timer)(0, config_1.NODE_SOLID_DURATION).subscribe(() => {
    const listOfAllNodes = Array.from(Array((0, config_1.loadStripsMap)().length).keys());
    (0, mappers_1.mapNodeListToSolidEvents)(listOfAllNodes, config_1.NODE_COLOR, config_1.NODE_SOLID_DURATION, config_1.NODE_SOLID_WIDTH).forEach((event) => {
        (0, serial_1.dispatchEvents)(event);
    });
});
