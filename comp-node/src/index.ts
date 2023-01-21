import { bufferTime, interval, map, take } from "rxjs";
import { MESSAGE_COLOR, MESSAGE_PACE, MESSAGE_WIDTH } from "./config";
import {
  getLinkedMessagesDurationInMs,
  linkEvents,
  MessageEvent,
} from "./events";
import { detection$Factory } from "./freenect";
import { getSegments, nodesToEvent, StripSegment } from "./path-finding";
import { dispatchEvent } from "./serial";

const SAVE_RESULTS = true;

const detection$ = detection$Factory(SAVE_RESULTS);
detection$.pipe(bufferTime(250)).subscribe((v) => console.log(v.length));
// detection$.pipe(
//    map(detectionsToDetectionEvents), map bounding boxes and cam id onto a node id
//    bufferTime() group a bunch of node ids
//    map(deduplicate)
//    mergeMap(listOfNodesToAllPairs)
//    groupBy(pairToPairKey)
//    mergeMap(o => {
//      return o.pipe(
//      )
//  .subscribe(nodeListToBehaviour)
//
// We want to take the node list and emit all the possible pairs
// Then for each pair, we have a dedicated observable
// this observable will keep emitting the message at the correct interval as long as during that interval it has recieved anotehr pair

let firstLinkedEvent = nodesToEvent(0, 8);
let firstLinkedEventDuration = getLinkedMessagesDurationInMs(firstLinkedEvent);

dispatchEvent({ type: "clear" });
interval(firstLinkedEventDuration).subscribe(() => {
  dispatchEvent(firstLinkedEvent);
});

// const firstLinkedEvent2 = nodesToEvent(3, 14);
// console.log("first linked event", firstLinkedEvent);
// const firstLinkedEventDuration2 =
//   getLinkedMessagesDurationInMs(firstLinkedEvent);
// console.log(firstLinkedEventDuration2);

// interval(firstLinkedEventDuration2).subscribe(() => {
//   dispatchEvent(firstLinkedEvent2);
// });
// firstLinkedEvent = nodesToEvent(15, 2);
// console.log("first linked event", firstLinkedEvent);
// firstLinkedEventDuration = getLinkedMessagesDurationInMs(firstLinkedEvent);
// console.log(firstLinkedEventDuration);

// interval(firstLinkedEventDuration).subscribe(() => {
//   dispatchEvent(firstLinkedEvent);
// });
