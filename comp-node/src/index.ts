import { bufferTime, map } from "rxjs";
import { DETECTION_BUFFER_TIME, NODE_SOLID_DURATION_TEST } from "./config";
import { detection$Factory } from "./freenect";
import {
  mapDetectionsToNodeList,
  mapNodeListToSolidEvents,
} from "./mapNodeListToSolidEvents";
import { dispatchEvents } from "./serial";

const SAVE_RESULTS = true;

const detection$ = detection$Factory(SAVE_RESULTS, false)
  .pipe(bufferTime(DETECTION_BUFFER_TIME), map(mapDetectionsToNodeList))
  .subscribe((nodesToActivate) => {
    // if it is single, then trigger single behaviour
    // otherwise get all pair permutations
    // group by pair key
    // for each group, trigger refresh the behaviour observable
    console.log(nodesToActivate);
    const events = mapNodeListToSolidEvents(nodesToActivate);
    events.forEach((e) => (e.duration = NODE_SOLID_DURATION_TEST));
    dispatchEvents(events);
  });

// Create the constantly on behaviour
// interval(NODE_SOLID_DURATION).subscribe(() => {
//   const listOfAllNodes = Array.from(Array(nodeToStripsMap.length).keys());
//   mapNodeListToSolidEvents(listOfAllNodes).forEach((event) => {
//     dispatchEvents(event);
//   });
// });

// TESTS FOR PATH FINDING

// let firstLinkedEvent = nodesToEvent(0, 8);
// let firstLinkedEventDuration = getLinkedMessagesDurationInMs(firstLinkedEvent);

// dispatchEvents({ type: "clear" });
// interval(firstLinkedEventDuration).subscribe(() => {
//   dispatchEvents(firstLinkedEvent);
// });

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
