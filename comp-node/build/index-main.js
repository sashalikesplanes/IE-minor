"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const cors_1 = __importDefault(require("cors"));
const rxjs_1 = require("rxjs");
const behaviour_handlers_1 = require("./behaviour-handlers");
const config_1 = require("./config");
const mappers_1 = require("./mappers");
const serial_1 = require("./serial");
const utils_1 = require("./utils");
// Clear all current behaviours
(0, serial_1.dispatchEvents)({ type: "clear", next: null });
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
(0, utils_1.loadStripsMap)().forEach((_, nodeIdx) => {
    const randomInterval = config_1.NODE_SOLID_MIN_INTERVAL + Math.random() * config_1.NODE_SOLID_MAX_INTERVAL;
    // for each interval, create a random event
    const event = (0, mappers_1.mapNodeListToConstantEvents)(nodeIdx, config_1.NODE_COLOR, randomInterval, config_1.NODE_SOLID_WIDTH, config_1.NODE_SOLID_FADE_DURATION, config_1.NODE_SOLID_FADE_DURATION, config_1.MESSAGE_FADE_POWER);
    (0, rxjs_1.timer)(0, randomInterval).subscribe(() => (0, serial_1.dispatchEvents)(event));
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
const detectNodeList$ = new rxjs_1.Observable((subscriber) => {
    const app = require('express')();
    const bodyParser = require('body-parser');
    app.use((0, cors_1.default)());
    app.use(bodyParser.json());
    // Regularly push random integers into the observable
    setInterval(() => {
        subscriber.next([(0, node_crypto_1.randomInt)(0, 6)]);
    }, 5000);
    app.post('/messages', (req, res) => {
        console.log(req.body);
        // Check if the request body is an array of numbers
        if (!req.body || !req.body.numbers || Array.isArray(req.body.numbers) && req.body.numbers.every(item => typeof item === 'number')) {
            console.log('Received numbers:', req.body.numbers);
            // Push the received numbers into the observable
            subscriber.next(req.body.numbers);
            res.status(200).send('Numbers received!');
        }
        else {
            res.status(400).send('Invalid request body!');
        }
    });
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}/`);
    });
}).pipe((0, rxjs_1.tap)(console.log), (0, rxjs_1.share)());
// const detectNodeList$ = detection$Factory(SILENT_DETECTIONS).pipe(
//   bufferTime(DETECTION_BUFFER_TIME_SPAN, DETECTION_BUFFER_CREATION_INTERVAL),
//   map(mapDetectionsToNodeList),
//   share()
// );
// Create the single node behaviour
behaviour_handlers_1.singleBehaviourHandlers.forEach((handler) => {
    detectNodeList$.subscribe(handler);
});
// Convert the list of nodes to a list of all node pairs
const detectedNodePair$ = detectNodeList$.pipe((0, rxjs_1.mergeMap)((nodeList) => {
    // create a list of all possible pairs
    if (nodeList.length < 2) {
        return [];
    }
    const pairs = nodeList.flatMap((node, idx) => {
        return nodeList.slice(idx + 1).map((otherNode) => {
            if (node < otherNode) {
                return [node, otherNode];
            }
            else {
                return [otherNode, node];
            }
        });
    });
    return (0, rxjs_1.from)(pairs);
}), (0, rxjs_1.share)());
// Create the message behaviour
behaviour_handlers_1.messageBehaviourHandlers.forEach((handler) => {
    detectedNodePair$.subscribe(handler);
});
