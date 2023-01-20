import { interval, map, take } from "rxjs";
import { MESSAGE_COLOR, MESSAGE_PACE, MESSAGE_WIDTH } from "./config";
import {
  getLinkedMessagesDurationInMs,
  linkEvents,
  MessageEvent,
} from "./events";
import { getSegments, StripSegment } from "./path-finding";
import { dispatchEvent } from "./serial";

const SAVE_RESULTS = true;

// const detection$ = detection$Factory(SAVE_RESULTS);
// detection$.subscribe(console.log);
// .pipe(map(detectionToNodeActivation), nodeActivationsToEvents)
// .subscribe(eventsToBehaviours);
//
function stripSegmentsToEvent(segments: StripSegment[]): MessageEvent[] {
  const forwardMessages = segments.map((segment) => ({
    type: "message" as MessageEvent["type"],
    ...segment,
    color: MESSAGE_COLOR,
    message_width: MESSAGE_WIDTH,
    pace: MESSAGE_PACE,
    next: null,
  }));

  const backwardMessages = segments
    .map((segment) => ({
      type: "message" as MessageEvent["type"],
      start_node: segment.end_node,
      end_node: segment.start_node,
      strip_idx: segment.strip_idx,
      start_idx: segment.end_idx,
      end_idx: segment.start_idx,
      color: MESSAGE_COLOR,
      message_width: MESSAGE_WIDTH,
      pace: MESSAGE_PACE,
      next: null,
    }))
    .reverse();

  return forwardMessages.concat(backwardMessages);
}

function nodesToEvent(startNode: number, endNode: number): MessageEvent {
  console.log("statrtNode", startNode);
  const segments = getSegments(startNode, endNode);
  console.log("segments", segments);
  const events = stripSegmentsToEvent(segments);
  console.log("events", events);
  return linkEvents(events);
}

let firstLinkedEvent = nodesToEvent(0, 8);
console.log("first linked event", firstLinkedEvent);
let firstLinkedEventDuration = getLinkedMessagesDurationInMs(firstLinkedEvent);
console.log(firstLinkedEventDuration);

interval(firstLinkedEventDuration).subscribe(() => {
  dispatchEvent(firstLinkedEvent);
});

const firstLinkedEvent2 = nodesToEvent(3, 14);
console.log("first linked event", firstLinkedEvent);
const firstLinkedEventDuration2 =
  getLinkedMessagesDurationInMs(firstLinkedEvent);
console.log(firstLinkedEventDuration2);

interval(firstLinkedEventDuration2).subscribe(() => {
  dispatchEvent(firstLinkedEvent2);
});
// firstLinkedEvent = nodesToEvent(15, 2);
// console.log("first linked event", firstLinkedEvent);
// firstLinkedEventDuration = getLinkedMessagesDurationInMs(firstLinkedEvent);
// console.log(firstLinkedEventDuration);

// interval(firstLinkedEventDuration).subscribe(() => {
//   dispatchEvent(firstLinkedEvent);
// });
