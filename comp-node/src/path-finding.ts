import { MAX_PIXEL_INDEX, MIN_PIXEL_INDEX } from "./config";
import { loadStripsMap } from "./utils";

export interface StripSegment {
  strip_idx: number;
  start_idx: number;
  end_idx: number;
  start_node: number;
  end_node: number;
}

export const edges: StripSegment[] = [];

const nodeToStripsMap = loadStripsMap();

nodeToStripsMap.forEach((startPixelIndices, nodeIndex) => {
  startPixelIndices.forEach((startPixelIndex, stripIndex) => {
    if (startPixelIndex === null) return;

    if (startPixelIndex < MIN_PIXEL_INDEX) startPixelIndex = MIN_PIXEL_INDEX;
    else if (startPixelIndex > MAX_PIXEL_INDEX)
      startPixelIndex = MAX_PIXEL_INDEX;

    let closestPositiveDistance = 1_000_000;
    let closestNegativeDistance = -1_000_000;
    let shortestPositiveSegment: StripSegment | null = null;
    let shortestNegativeSegment: StripSegment | null = null;

    nodeToStripsMap.forEach((endPixelIndices, otherNodeIdx) => {
      if (otherNodeIdx === nodeIndex) return;

      let endIndex = endPixelIndices[stripIndex];
      if (endIndex === null) return;
      if (endIndex < MIN_PIXEL_INDEX) endIndex = MIN_PIXEL_INDEX;
      else if (endIndex > MAX_PIXEL_INDEX) endIndex = MAX_PIXEL_INDEX;

      const distance = endIndex - (startPixelIndex as number);
      if (distance > 0 && distance < closestPositiveDistance) {
        closestPositiveDistance = distance;
        shortestPositiveSegment = {
          strip_idx: stripIndex,
          start_idx: startPixelIndex as number, // already checked for null
          end_idx: endIndex,
          start_node: nodeIndex,
          end_node: otherNodeIdx,
        };
      }

      if (distance < 0 && distance > closestNegativeDistance) {
        closestNegativeDistance = distance;
        shortestNegativeSegment = {
          strip_idx: stripIndex,
          start_idx: startPixelIndex as number, // already checked for null
          end_idx: endIndex,
          start_node: nodeIndex,
          end_node: otherNodeIdx,
        };
      }
    });
    if (shortestPositiveSegment) edges.push(shortestPositiveSegment);
    if (shortestNegativeSegment) edges.push(shortestNegativeSegment);
  });
});

function findEdge(startNode: number, endNode: number): StripSegment | null {
  for (const edge of edges) {
    if (edge.start_node === startNode && edge.end_node === endNode) {
      return edge;
    }
  }
  return null;
}

function getShortestPath(startNode: number, endNode: number): number[] {
  const dist = new Array<number>(loadStripsMap().length).fill(1_000_000);
  const prev = new Array<number | null>(loadStripsMap().length).fill(null);
  const Q = new Array<number>(loadStripsMap().length).fill(0).map((_, i) => i);

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
      if (!connection) continue;
      const alt =
        dist[minDistanceNode] +
        Math.abs(connection.start_idx - connection.end_idx);
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = minDistanceNode;
      }
    }
  }

  const path: number[] = [];
  let u: number | null = endNode;
  while (u !== null) {
    path.unshift(u);
    u = prev[u];
  }
  return path;
}

function pathToSegments(path: number[]): StripSegment[] {
  const segments: StripSegment[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const segment = findEdge(path[i], path[i + 1]);
    if (segment) segments.push(segment);
  }
  return segments;
}

export function getSegments(
  startNode: number,
  endNode: number
): StripSegment[] {
  const path = getShortestPath(startNode, endNode);
  return pathToSegments(path);
}
