import { DOUBLE_LENGTH_STRIP_INDECES, MAX_PIXEL_INDEX, MIN_PIXEL_INDEX } from "./config";
import {
  ConstantEvent,
  linkEvents,
  MessageEvent,
  Pixel,
  setPaceForADuration,
} from "./events";
import { getSegments, StripSegment } from "./path-finding";
import { loadCameraMap, loadStripsMap } from "./utils";

export interface NanodetDetection {
  source: "camera_0" | "camera_1";
  label: number;
  score: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function mapDetectionsToNodeList(
  detections: NanodetDetection[]
): number[] {
  const nodeList: number[] = [];
  detections.forEach((detection) => {
    const nodeIdx = mapDetectionToNode(detection);
    if (nodeIdx !== null) {
      nodeList.push(nodeIdx);
    }
  });
  return [...new Set(nodeList)];
}

function mapDetectionToNode(detection: NanodetDetection): number | null {
  let nodeIdxToReturn = null;
  loadCameraMap()[detection.source].forEach((node, nodeIdx) => {
    if (
      node.x > detection.x1 &&
      node.x < detection.x2 &&
      node.y > detection.y1 &&
      node.y < detection.y2
    ) {
      nodeIdxToReturn = nodeIdx;
    }
  });
  return nodeIdxToReturn;
}

export function mapNodeListToConstantEvents(
  nodes: number[] | number,
  color: number[],
  duration: number,
  width: number,
  fadeInDuration?: number,
  fadeOutDuration?: number,
  power?: number
): ConstantEvent[] {
  if (!Array.isArray(nodes)) {
    nodes = [nodes];
  }
  return nodes.flatMap((nodeIdx) => {
    const pixelIdxPerStrip = loadStripsMap()[nodeIdx];
    return pixelIdxPerStrip.map((pixelIdx, stripIdx) =>
      mapNodeStripPixelToConstantEvent(
        pixelIdx,
        stripIdx,
        color,
        duration,
        width,
        fadeInDuration,
        fadeOutDuration,
        power
      )
    );
  });
}

export function mapNodeStripPixelToConstantEvent(
  pixelIdx: number | null,
  stripIdx: number,
  color: number[],
  duration: number,
  width: number,
  fadeInDuration = 0,
  fadeOutDuration = 0,
  fadePower = 1
): ConstantEvent {
  const baseEvent = {
    type: "constant",
    color,
    duration,
    fadein_duration: fadeInDuration,
    fadeout_duration: fadeOutDuration,
    fade_power: fadePower,
    next: null,
  } satisfies Partial<ConstantEvent>;

  if (pixelIdx === null) {
    return { ...baseEvent, pixels: [] };
  }

  // create an array of pixels based on node_width
  const pixels: Pixel[] = [];
  for (let i = -width; i <= width; i++) {
    const currentPixelIdx = pixelIdx + i;
    if (
      currentPixelIdx < MIN_PIXEL_INDEX ||
      currentPixelIdx > (DOUBLE_LENGTH_STRIP_INDECES.includes(stripIdx) ? MAX_PIXEL_INDEX * 2 : MAX_PIXEL_INDEX)
    ) {
      continue;
    }
    pixels.push({ strip_idx: stripIdx, pixel_idx: pixelIdx + i });
  }

  return { ...baseEvent, pixels };
}
export function mapStripSegmentsToEvents(
  segments: StripSegment[],
  color: number[],
  width: number,
  pace: number,
  includeBackwards: boolean
): MessageEvent[] {
  const forwardMessages = segments.map((segment) => ({
    type: "message" as MessageEvent["type"],
    ...segment,
    color,
    message_width: width,
    pace: pace,
    next: null,
  }));

  if (!includeBackwards) return forwardMessages;

  const backwardMessages = segments
    .map((segment) => ({
      type: "message" as MessageEvent["type"],
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

export function mapNodesToEventsWithPace(
  startNode: number,
  endNode: number,
  color: number[],
  width: number,
  pace: number,
  includeBackwards: boolean
): MessageEvent {
  const segments = getSegments(startNode, endNode);
  const events = mapStripSegmentsToEvents(
    segments,
    color,
    width,
    pace,
    includeBackwards
  );
  return linkEvents(events);
}

export function mapNodesToEventsWithDuration(
  startNode: number,
  endNode: number,
  color: number[],
  width: number,
  duration: number,
  includeBackwards: boolean
): MessageEvent {
  const segments = getSegments(startNode, endNode);
  let events = mapStripSegmentsToEvents(
    segments,
    color,
    width,
    1,
    includeBackwards
  );
  events = events.map((event) => setPaceForADuration(event, duration));
  return linkEvents(events);
}
