"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageBehaviourHandlers = exports.singleBehaviourHandlers = void 0;
const config_1 = require("./config");
const events_1 = require("./events");
const mappers_1 = require("./mappers");
const path_finding_1 = require("./path-finding");
const serial_1 = require("./serial");
exports.singleBehaviourHandlers = new Map();
(0, config_1.loadStripsMap)().forEach((_, nodeIdx) => {
    exports.singleBehaviourHandlers.set(nodeIdx, createSingleBehaviourHandler(nodeIdx));
});
exports.messageBehaviourHandlers = new Map();
// for each pair of nodes, create a handler
(0, config_1.loadStripsMap)().forEach((_, nodeIdx) => {
    (0, config_1.loadStripsMap)().forEach((_, otherNodeIdx) => {
        if (otherNodeIdx <= nodeIdx)
            return;
        const key = nodeIdx < otherNodeIdx
            ? `${nodeIdx}-${otherNodeIdx}`
            : `${otherNodeIdx}-${nodeIdx}`;
        exports.messageBehaviourHandlers.set(key, createMessageBehaviourHandler(key));
    });
});
console.log(exports.messageBehaviourHandlers.keys());
function createMessageBehaviourHandler(key) {
    // create all the events to be dispatched and record the duration
    const startNode = parseInt(key.split("-")[0]);
    const endNode = parseInt(key.split("-")[1]);
    const firstEvent = (0, mappers_1.mapNodesToEventsWithPace)(startNode, endNode, config_1.MESSAGE_COLOR, config_1.MESSAGE_WIDTH, config_1.MESSAGE_PACE, config_1.MESSAGE_INCLUDE_BACKWARDS);
    const totalDuration = (0, events_1.getLinkedMessagesDurationInMs)(firstEvent);
    let lastDispatchTime = new Date().getTime() - totalDuration - 1;
    return function (nodePair) {
        const currentKey = nodePair[0] < nodePair[1]
            ? `${nodePair[0]}-${nodePair[1]}`
            : `${nodePair[1]}-${nodePair[0]}`;
        if (currentKey !== key)
            return;
        if (new Date().getTime() - lastDispatchTime < totalDuration)
            return;
        lastDispatchTime = new Date().getTime();
        (0, serial_1.dispatchEvents)(firstEvent);
    };
}
function createSingleBehaviourHandler(nodeIdx) {
    const connectedEdges = path_finding_1.edges.filter((edge) => edge.start_node === nodeIdx);
    const events = connectedEdges.map((edge) => (0, mappers_1.mapNodesToEventsWithDuration)(nodeIdx, edge.end_node, config_1.SINGLE_COLOR, config_1.SINGLE_WIDTH, config_1.SINGLE_DURATION, config_1.SINGLE_INCLUDE_BACKWARDS));
    let lastDispatchTime = new Date().getTime() - config_1.SINGLE_DURATION - 1;
    return function (nodeList) {
        if (nodeList.length !== 1 || nodeList[0] !== nodeIdx)
            return;
        console.warn("this is the single behaviour handler", nodeList);
        if (new Date().getTime() - lastDispatchTime < config_1.SINGLE_DURATION)
            return;
        lastDispatchTime = new Date().getTime();
        console.warn("dispatching events", events);
        (0, serial_1.dispatchEvents)(events);
    };
}
