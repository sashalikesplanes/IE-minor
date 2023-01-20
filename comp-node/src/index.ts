import { interval, map, take } from "rxjs";
import {
  getLinkedMessagesDurationInMs,
  getMessageDurationInMs,
  linkEvents,
  message1,
  message2,
  message3,
  MessageEvent,
  reverseMessage,
} from "./events";
import { detection$Factory } from "./freenect";
import { dispatchEvent } from "./serial";

const SAVE_RESULTS = true;

// const detection$ = detection$Factory(SAVE_RESULTS);
// detection$.subscribe(console.log);
// .pipe(map(detectionToNodeActivation), nodeActivationsToEvents)
// .subscribe(eventsToBehaviours);
//
const testEvents = [
  message1,
  message2,
  message3,
  reverseMessage(message3),
  reverseMessage(message2),
  reverseMessage(message1),
];

const firstLinkedEvent = linkEvents(testEvents);

interval(getLinkedMessagesDurationInMs(firstLinkedEvent)).subscribe(() => {
  dispatchEvent(firstLinkedEvent);
});
