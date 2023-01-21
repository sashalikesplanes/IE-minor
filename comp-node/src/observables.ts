// A hash map of observables to emit a message per node pair

import { Observable } from "rxjs";
import { MessageEvent } from "./events";
import { getSegments, stripSegmentsToEvents } from "./path-finding";

//
const map = new Map<string, Observable<MessageEvent>>();

// fill the map

export function getMessageObservable(
  startNode: number,
  endNode: number
): Observable<MessageEvent> {
  const key =
    endNode > startNode ? `${startNode}-${endNode}` : `${endNode}-${startNode}`;
  let observable = map.get(key);
  if (observable) {
    return observable;
  }
  // create the observable
  observable = new Observable<MessageEvent>((subscriber) => {
    const segments = getSegments(startNode, endNode);
    const events = stripSegmentsToEvents(segments);
    events.forEach((event) => subscriber.next(event));
    subscriber.complete();
  });
  // save the observable
  map.set(key, observable);
  return observable;
}
