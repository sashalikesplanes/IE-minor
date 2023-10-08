import { randomInt } from "node:crypto";
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Observable, from, interval, map, mergeMap, share, tap, timer } from "rxjs";
import {
  messageBehaviourHandlers,
  singleBehaviourHandlers,
} from "./behaviour-handlers";
import {
  MESSAGE_FADE_POWER,
  NODE_COLOR,
  NODE_SOLID_FADE_DURATION,
  NODE_SOLID_MAX_INTERVAL,
  NODE_SOLID_MIN_INTERVAL,
  NODE_SOLID_WIDTH,
} from "./config";
import {
  mapDetectionsToNodeList,
  mapNodeListToConstantEvents,
} from "./mappers";
import { dispatchEvents } from "./serial";
import { loadStripsMap } from "./utils";

// Clear all current behaviours
dispatchEvents({ type: "clear", next: null });

// Start ambient sound
// playSound(AMBIENT_SOUND_REL_PATH, true, AMBIENT_VOLUME);
// playNarration();

// Too many events for it to keep track
// edges.forEach((edge) => {
//   // for each edge create an infibute rabdin observable
//   const randomInterval =
//     PASSIVE_MESSAGE_MIN_INTERVAL + Math.random() * PASSIVE_MESSAGE_MAX_INTERVAL;
//   range(0, 1000000)
//     .pipe(concatMap((i) => of(i).pipe(delay(randomInterval))))
//     .subscribe(() => {
//       // for each interval, create a random event
//       const event = mapNodesToEventsWithDuration(
//         edge.start_node,
//         edge.end_node,
//         PASSIVE_COLOR,
//         PASSIVE_WIDTH,
//         PASSIVE_MESSAGE_MIN_INTERVAL +
//           Math.random() * PASSIVE_MESSAGE_MAX_INTERVAL,
//         false
//       );
//       dispatchEvents(event);
//     });
// });

loadStripsMap().forEach((_, nodeIdx) => {
  const randomInterval =
    NODE_SOLID_MIN_INTERVAL + Math.random() * NODE_SOLID_MAX_INTERVAL;
  // for each interval, create a random event
  const event = mapNodeListToConstantEvents(
    nodeIdx,
    NODE_COLOR,
    randomInterval,
    NODE_SOLID_WIDTH,
    NODE_SOLID_FADE_DURATION,
    NODE_SOLID_FADE_DURATION,
    MESSAGE_FADE_POWER
  );
  timer(0, randomInterval).subscribe(() => dispatchEvents(event));
});

// Create the constantly on behaviour
// timer(0, NODE_SOLID_DURATION).subscribe(() => {
//   // Change these to be pulsing at random intervals
//   const listOfAllNodes = Array.from(Array(loadStripsMap().length).keys());
//   mapNodeListToConstantEvents(
//     listOfAllNodes,
//     NODE_COLOR,
//     NODE_SOLID_DURATION,
//     NODE_SOLID_WIDTH
//   ).forEach((event) => {
//     // change these to be pulsing at random intervals
//     dispatchEvents(event);
//   });
// });

// setup an express server to listen for detections
const detectNodeList$ = new Observable<number[]>((subscriber) => {
  const app = require('express')();
  const bodyParser = require('body-parser');
  app.use(cors())
  app.use(bodyParser.json());

  // Regularly push random integers into the observable
  setInterval(() => {
    subscriber.next([randomInt(0, 6)]);
  }, 5000);

  app.post('/messages', (req, res) => {
    console.log(req.body)
    // Check if the request body is an array of numbers
    if (!req.body || !req.body.numbers || Array.isArray(req.body.numbers) && req.body.numbers.every(item => typeof item === 'number')) {
      console.log('Received numbers:', req.body.numbers);

      // Push the received numbers into the observable
      subscriber.next(req.body.numbers);

      res.status(200).send('Numbers received!');
    } else {
      res.status(400).send('Invalid request body!');
    }
  });

  const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`);
  });

}).pipe(tap(console.log), share());

// const detectNodeList$ = detection$Factory(SILENT_DETECTIONS).pipe(
//   bufferTime(DETECTION_BUFFER_TIME_SPAN, DETECTION_BUFFER_CREATION_INTERVAL),
//   map(mapDetectionsToNodeList),
//   share()
// );

// Create the single node behaviour
singleBehaviourHandlers.forEach((handler) => {
  detectNodeList$.subscribe(handler);
});

// Convert the list of nodes to a list of all node pairs
const detectedNodePair$ = detectNodeList$.pipe(
  mergeMap((nodeList) => {
    // create a list of all possible pairs
    if (nodeList.length < 2) {
      return [];
    }

    const pairs = nodeList.flatMap((node, idx) => {
      return nodeList.slice(idx + 1).map((otherNode) => {
        if (node < otherNode) {
          return [node, otherNode];
        } else {
          return [otherNode, node];
        }
      });
    });
    return from(pairs);
  }),
  share()
);

// Create the message behaviour
messageBehaviourHandlers.forEach((handler) => {
  detectedNodePair$.subscribe(handler);
});
