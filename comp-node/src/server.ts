import { dispatchEvents } from "./serial";
export const app = require('express')();
import cors from 'cors';
import { LOVE_COLOR, LOVE_DURATION, LOVE_PACE, LOVE_WIDTH } from "./config";
import { mikeState } from './state';
app.use(cors())

app.get('/love', (_, res) => {
  mikeState.isInLove = true;
  setTimeout(() => {
    mikeState.isInLove = false;
  }, LOVE_DURATION);

  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((strip) => {
    dispatchEvents({
      type: 'message',
      start_idx: 0,
      end_idx: 100,
      strip_idx: strip,
      color: LOVE_COLOR,
      message_width: LOVE_WIDTH,
      pace: LOVE_PACE,
      start_node: 0,
      end_node: 0,
      next: {
        type: 'message',
        start_idx: 100,
        end_idx: 0,
        strip_idx: strip,
        color: LOVE_COLOR,
        message_width: LOVE_WIDTH,
        pace: LOVE_PACE,
        start_node: 0,
        end_node: 0,
        next: null
      }
    });
    // Check if the request body is an array of numbers
  });
  res.status(200).send('Love recieved');

});


