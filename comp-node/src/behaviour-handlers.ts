// A hash map of observables to emit a message per node pair

import {
  nodeToStripsMap,
  SINGLE_COLOR,
  SINGLE_DURATION,
  SINGLE_INCLUDE_BACKWARDS,
  SINGLE_WIDTH,
} from "./config";
import { edges, mapNodesToEventsWithDuration } from "./path-finding";
import { dispatchEvents } from "./serial";

export const singleBehaviourHandlers = new Map<
  number,
  (nodeList: number[]) => void
>();
nodeToStripsMap.forEach((_, nodeIdx) => {
  singleBehaviourHandlers.set(nodeIdx, createSingleBehaviourHandler(nodeIdx));
});

function createSingleBehaviourHandler(
  nodeIdx: number
): (nodeList: number[]) => void {
  const connectedEdges = edges.filter((edge) => edge.start_node === nodeIdx);
  const events = connectedEdges.map((edge) =>
    mapNodesToEventsWithDuration(
      nodeIdx,
      edge.end_node,
      SINGLE_COLOR,
      SINGLE_WIDTH,
      SINGLE_DURATION,
      SINGLE_INCLUDE_BACKWARDS
    )
  );

  let lastDispatchTime = new Date().getTime() - SINGLE_DURATION - 1;

  return function (nodeList: number[]): void {
    if (nodeList.length !== 1 || nodeList[0] !== nodeIdx) return;
    console.warn("this is the single behaviour handler", nodeList);
    if (new Date().getTime() - lastDispatchTime < SINGLE_DURATION) return;
    lastDispatchTime = new Date().getTime();
    console.warn("dispatching events", events);
    dispatchEvents(events);
  };
}

/*
      mergeMap((group) => {
      switch (group.key) {
        case "passive":
          return new Observable();
        case "multiple":
          return new Observable();
        default:
          console.log("single", group.key);
          return group.pipe(
            map((nodes) => {
              const node = nodes[0];
              const events = connectedEdges.map((edge) =>
                mapNodesToEvents(node, edge.end_node)
              );
              events.forEach((event) => {
                const duration = getMessageDurationInMs(event);
                if (duration > maxDuration) maxDuration = duration;
              });
              return events;
            }),
            sampleTime(maxDuration)
          );
      }
    })
*/

// fill the map
// export function createOrGetSingleBehaviour$(
//   nodeIdx: number
// ): Observable<MessageEvent> {
//   let observable = singleBehvaiourObservables.get(nodeIdx);
//   if (observable) {
//     return observable;
//   }
//   // get the neighbours
//   // create an event per neighbour
//   // get the longest duration
//   const longestDuration = 1000;
//   observable = timer(0, longestDuration);
//   // save the observable
//   singleBehvaiourObservables.set(nodeIdx, observable);
//   return observable;
// }

// export function getMessageObservable(
//   startNode: number,
//   endNode: number
// ): Observable<MessageEvent> {
//   const key =
//     endNode > startNode ? `${startNode}-${endNode}` : `${endNode}-${startNode}`;
//   let observable = map.get(key);
//   if (observable) {
//     return observable;
//   }
//   // create the observable
//   observable = new Observable<MessageEvent>((subscriber) => {
//     const segments = getSegments(startNode, endNode);
//     const events = stripSegmentsToEvents(segments);
//     events.forEach((event) => subscriber.next(event));
//     subscriber.complete();
//   });
//   // save the observable
//   map.set(key, observable);
//   return observable;
// }
