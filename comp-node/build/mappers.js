"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapNodesToEventsWithDuration = exports.mapNodesToEventsWithPace = exports.mapStripSegmentsToEvents = exports.mapNodeStripPixelToSolidEvent = exports.mapNodeListToSolidEvents = exports.mapDetectionsToNodeList = void 0;
const config_1 = require("./config");
const events_1 = require("./events");
const path_finding_1 = require("./path-finding");
const utils_1 = require("./utils");
function mapDetectionsToNodeList(detections) {
    const nodeList = [];
    detections.forEach((detection) => {
        const nodeIdx = mapDetectionToNode(detection);
        if (nodeIdx !== null) {
            nodeList.push(nodeIdx);
        }
    });
    return [...new Set(nodeList)];
}
exports.mapDetectionsToNodeList = mapDetectionsToNodeList;
function mapDetectionToNode(detection) {
    let nodeIdxToReturn = null;
    (0, utils_1.loadCameraMap)()[detection.source].forEach((node, nodeIdx) => {
        if (node.x > detection.x1 &&
            node.x < detection.x2 &&
            node.y > detection.y1 &&
            node.y < detection.y2) {
            nodeIdxToReturn = nodeIdx;
        }
    });
    return nodeIdxToReturn;
}
function mapNodeListToSolidEvents(nodes, color, duration, width) {
    if (!Array.isArray(nodes)) {
        nodes = [nodes];
    }
    return nodes.flatMap((nodeIdx) => {
        const pixelIdxPerStrip = (0, utils_1.loadStripsMap)()[nodeIdx];
        return pixelIdxPerStrip.map((pixelIdx, stripIdx) => mapNodeStripPixelToSolidEvent(pixelIdx, stripIdx, color, duration, width));
    });
}
exports.mapNodeListToSolidEvents = mapNodeListToSolidEvents;
function mapNodeStripPixelToSolidEvent(pixelIdx, stripIdx, color, duration, width) {
    if (pixelIdx === null) {
        return {
            type: "solid",
            color: color,
            duration: duration,
            pixels: [],
        };
    }
    // create an array of pixels based on node_width
    const pixels = [];
    for (let i = -width; i <= width; i++) {
        const currentPixelIdx = pixelIdx + i;
        if (currentPixelIdx < config_1.MIN_PIXEL_INDEX ||
            currentPixelIdx > config_1.MAX_PIXEL_INDEX) {
            continue;
        }
        pixels.push({ strip_idx: stripIdx, pixel_idx: pixelIdx + i });
    }
    return {
        type: "solid",
        color: color,
        duration: duration,
        pixels,
    };
}
exports.mapNodeStripPixelToSolidEvent = mapNodeStripPixelToSolidEvent;
function mapStripSegmentsToEvents(segments, color, width, pace, includeBackwards) {
    const forwardMessages = segments.map((segment) => (Object.assign(Object.assign({ type: "message" }, segment), { color, message_width: width, pace: pace, next: null })));
    if (!includeBackwards)
        return forwardMessages;
    const backwardMessages = segments
        .map((segment) => ({
        type: "message",
        start_node: segment.end_node,
        end_node: segment.start_node,
        strip_idx: segment.strip_idx,
        start_idx: segment.end_idx,
        end_idx: segment.start_idx,
        color: color,
        message_width: width,
        pace: pace,
        next: null,
    }))
        .reverse();
    return forwardMessages.concat(backwardMessages);
}
exports.mapStripSegmentsToEvents = mapStripSegmentsToEvents;
function mapNodesToEventsWithPace(startNode, endNode, color, width, pace, includeBackwards) {
    const segments = (0, path_finding_1.getSegments)(startNode, endNode);
    const events = mapStripSegmentsToEvents(segments, color, width, pace, includeBackwards);
    return (0, events_1.linkEvents)(events);
}
exports.mapNodesToEventsWithPace = mapNodesToEventsWithPace;
function mapNodesToEventsWithDuration(startNode, endNode, color, width, duration, includeBackwards) {
    const segments = (0, path_finding_1.getSegments)(startNode, endNode);
    let events = mapStripSegmentsToEvents(segments, color, width, 1, includeBackwards);
    events = events.map((event) => (0, events_1.setPaceForADuration)(event, duration));
    return (0, events_1.linkEvents)(events);
}
exports.mapNodesToEventsWithDuration = mapNodesToEventsWithDuration;
