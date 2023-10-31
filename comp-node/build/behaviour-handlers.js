"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageBehaviourHandler = exports.messageBehaviourHandlers = exports.singleBehaviourHandlers = void 0;
const config_1 = require("./config");
const events_1 = require("./events");
const path_finding_1 = require("./path-finding");
const mappers_1 = require("./mappers");
const path_finding_2 = require("./path-finding");
const serial_1 = require("./serial");
const sounds_1 = require("./sounds");
const utils_1 = require("./utils");
exports.singleBehaviourHandlers = new Map();
// For each node, create a handler
(0, utils_1.loadStripsMap)().forEach((_, nodeIdx) => {
    exports.singleBehaviourHandlers.set(nodeIdx, createSingleBehaviourHandler(nodeIdx));
});
exports.messageBehaviourHandlers = new Map();
// For each pair of nodes, create a handler
(0, utils_1.loadStripsMap)().forEach((_, nodeIdx) => {
    (0, utils_1.loadStripsMap)().forEach((_, otherNodeIdx) => {
        if (otherNodeIdx <= nodeIdx)
            return;
        const key = nodeIdx < otherNodeIdx
            ? `${nodeIdx}-${otherNodeIdx}`
            : `${otherNodeIdx}-${nodeIdx}`;
        exports.messageBehaviourHandlers.set(key, createMessageBehaviourHandler(key));
    });
});
function createMessageBehaviourHandler(key) {
    // create all the events to be dispatched and record the duration
    const startNode = parseInt(key.split("-")[0]);
    const endNode = parseInt(key.split("-")[1]);
    const firstMessageEvent = (0, mappers_1.mapNodesToEventsWithPace)(
    // Subsequent are linked
    startNode, endNode, config_1.MESSAGE_COLOR, config_1.MESSAGE_WIDTH, config_1.MESSAGE_PACE, config_1.MESSAGE_INCLUDE_BACKWARDS);
    // playSoundPerEvent(firstMessageEvent, MESSAGE_SOUND_REL_PATH);
    const totalDurationMs = // MESSAGE_CONSTANT_DURATION;
     (0, events_1.getLinkedMessagesDurationInMs)(firstMessageEvent) / config_1.MESSAGE_DURATION_DIVIDER;
    const fadeInMessageEvents = (0, mappers_1.mapNodeListToConstantEvents)([startNode, endNode], config_1.MESSAGE_COLOR, totalDurationMs / 1000, config_1.NODE_SOLID_WIDTH, config_1.MESSAGE_FADE_DURATION, 0, config_1.MESSAGE_FADE_POWER);
    const nodes = (0, path_finding_1.getSegments)(startNode, endNode).flatMap((segment) => [
        segment.start_node,
        segment.end_node,
    ]);
    const nodeSet = new Set(nodes);
    nodeSet.delete(startNode);
    nodeSet.delete(endNode);
    // get all nodes apart from start end
    const middleEvents = (0, mappers_1.mapNodeListToConstantEvents)([...nodeSet], config_1.NODE_COLOR, totalDurationMs / 1000, config_1.NODE_SOLID_WIDTH, config_1.MESSAGE_FADE_DURATION, 0, config_1.MESSAGE_FADE_POWER);
    (0, mappers_1.mapNodeListToConstantEvents)([startNode, endNode], config_1.MESSAGE_COLOR, config_1.MESSAGE_FADE_DURATION, config_1.NODE_SOLID_WIDTH, 0, config_1.MESSAGE_FADE_DURATION, config_1.MESSAGE_FADE_POWER).forEach((event, eventIdx) => {
        fadeInMessageEvents[eventIdx].next = event;
    });
    let lastDispatchTime = new Date().getTime() - totalDurationMs - 1;
    return function (nodePair) {
        const currentKey = nodePair[0] < nodePair[1]
            ? `${nodePair[0]}-${nodePair[1]}`
            : `${nodePair[1]}-${nodePair[0]}`;
        if (currentKey !== key)
            return;
        if (new Date().getTime() - lastDispatchTime < totalDurationMs / config_1.MESSAGE_MULTIPLIER) {
            return;
        }
        if (new Date().getTime() - lastDispatchTime >
            totalDurationMs * config_1.MESSAGE_FADE_IN_TIMEOUT_MULTIPLIER) {
            (0, serial_1.dispatchEvents)([
                ...fadeInMessageEvents,
                firstMessageEvent,
                ...middleEvents,
            ]);
        }
        else {
            (0, serial_1.dispatchEvents)([
                ...fadeInMessageEvents.map((e) => (Object.assign(Object.assign({}, e), { fadein_duration: 0 }))),
                firstMessageEvent,
                ...middleEvents,
            ]);
        }
        (0, sounds_1.playSoundPerEvent)(firstMessageEvent, config_1.MESSAGE_SOUND_REL_PATH, config_1.MESSAGE_VOLUME);
        lastDispatchTime = new Date().getTime();
    };
}
exports.createMessageBehaviourHandler = createMessageBehaviourHandler;
function createSingleBehaviourHandler(nodeIdx) {
    const connectedEdges = path_finding_2.edges.filter((edge) => edge.start_node === nodeIdx);
    const events = connectedEdges.map((edge) => (0, mappers_1.mapNodesToEventsWithDuration)(nodeIdx, edge.end_node, config_1.SINGLE_COLOR, config_1.SINGLE_WIDTH, config_1.SINGLE_LED_DURATION, config_1.SINGLE_INCLUDE_BACKWARDS));
    let lastMessageTime = new Date().getTime() - config_1.SINGLE_LED_DURATION - 1;
    let lastSoundTime = new Date().getTime() - config_1.SINGLE_LED_DURATION * config_1.SINGLE_SOUND_MESSAGES - 1;
    return function (nodeList) {
        if (nodeList.length !== 1 || nodeList[0] !== nodeIdx)
            return;
        if (new Date().getTime() - lastSoundTime >
            config_1.SINGLE_LED_DURATION * config_1.SINGLE_SOUND_MESSAGES) {
            lastSoundTime = new Date().getTime();
            (0, sounds_1.playSound)(config_1.SINGLE_SOUND_REL_PATH, false, config_1.SINGLE_VOLUME);
        }
        if (new Date().getTime() - lastMessageTime > config_1.SINGLE_LED_DURATION / config_1.SINGLE_PULSE_MULTIPLIER) {
            lastMessageTime = new Date().getTime();
            (0, serial_1.dispatchEvents)(events);
        }
    };
}
