"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSegments = exports.edges = void 0;
const config_1 = require("./config");
exports.edges = [];
(0, config_1.loadStripsMap)().forEach((startPixelIndices, nodeIndex) => {
    startPixelIndices.forEach((startPixelIndex, stripIndex) => {
        if (startPixelIndex === null)
            return;
        if (startPixelIndex < config_1.MIN_PIXEL_INDEX)
            startPixelIndex = config_1.MIN_PIXEL_INDEX;
        else if (startPixelIndex > config_1.MAX_PIXEL_INDEX)
            startPixelIndex = config_1.MAX_PIXEL_INDEX;
        let closestPositiveDistance = 1000000;
        let closestNegativeDistance = -1000000;
        let shortestPositiveSegment = null;
        let shortestNegativeSegment = null;
        (0, config_1.loadStripsMap)().forEach((endPixelIndices, otherNodeIdx) => {
            if (otherNodeIdx === nodeIndex)
                return;
            let endIndex = endPixelIndices[stripIndex];
            if (endIndex === null)
                return;
            if (endIndex < config_1.MIN_PIXEL_INDEX)
                endIndex = config_1.MIN_PIXEL_INDEX;
            else if (endIndex > config_1.MAX_PIXEL_INDEX)
                endIndex = config_1.MAX_PIXEL_INDEX;
            const distance = endIndex - startPixelIndex;
            if (distance > 0 && distance < closestPositiveDistance) {
                closestPositiveDistance = distance;
                shortestPositiveSegment = {
                    strip_idx: stripIndex,
                    start_idx: startPixelIndex,
                    end_idx: endIndex,
                    start_node: nodeIndex,
                    end_node: otherNodeIdx,
                };
            }
            if (distance < 0 && distance > closestNegativeDistance) {
                closestNegativeDistance = distance;
                shortestNegativeSegment = {
                    strip_idx: stripIndex,
                    start_idx: startPixelIndex,
                    end_idx: endIndex,
                    start_node: nodeIndex,
                    end_node: otherNodeIdx,
                };
            }
        });
        if (shortestPositiveSegment)
            exports.edges.push(shortestPositiveSegment);
        if (shortestNegativeSegment)
            exports.edges.push(shortestNegativeSegment);
    });
});
function findEdge(startNode, endNode) {
    for (const edge of exports.edges) {
        if (edge.start_node === startNode && edge.end_node === endNode) {
            return edge;
        }
    }
    return null;
}
function getShortestPath(startNode, endNode) {
    const dist = new Array((0, config_1.loadStripsMap)().length).fill(1000000);
    const prev = new Array((0, config_1.loadStripsMap)().length).fill(null);
    const Q = new Array((0, config_1.loadStripsMap)().length).fill(0).map((_, i) => i);
    dist[startNode] = 0;
    while (Q.length > 0) {
        const distancesInQ = Q.map((node) => [node, dist[node]]);
        let minDistance = distancesInQ[0][1];
        let minDistanceNode = distancesInQ[0][0];
        for (const current of distancesInQ.slice(1)) {
            const currentNode = current[0];
            const currentDistance = current[1];
            if (currentDistance < minDistance) {
                minDistance = currentDistance;
                minDistanceNode = currentNode;
            }
        }
        Q.splice(Q.indexOf(minDistanceNode), 1);
        if (minDistanceNode === endNode) {
            break;
        }
        for (const v of Q) {
            const connection = findEdge(minDistanceNode, v);
            if (!connection)
                continue;
            const alt = dist[minDistanceNode] +
                Math.abs(connection.start_idx - connection.end_idx);
            if (alt < dist[v]) {
                dist[v] = alt;
                prev[v] = minDistanceNode;
            }
        }
    }
    const path = [];
    let u = endNode;
    while (u !== null) {
        path.unshift(u);
        u = prev[u];
    }
    return path;
}
function pathToSegments(path) {
    const segments = [];
    for (let i = 0; i < path.length - 1; i++) {
        const segment = findEdge(path[i], path[i + 1]);
        if (segment)
            segments.push(segment);
    }
    return segments;
}
function getSegments(startNode, endNode) {
    const path = getShortestPath(startNode, endNode);
    return pathToSegments(path);
}
exports.getSegments = getSegments;
