import { join } from "path";

// KinectNN settings
export const USE_CORRIDOR_CAM = true;
export const USE_WINDOW_CAM = true;
export const SAVE_OUTPUT_IMAGE = true;
export const SAVE_EACH_OUTPUT_IMAGE = false;
export const NMS_THRESHOLD = 0.9; // higher allows for more detectins of same hand
export const SCORE_THRESHOLD = 0.3; // lower allows for less confident detections
export const WINDOW_CAM_PROBABILITY = 0.5; // probability of applying NN to window cam
export const SILENT_DETECTIONS = false;

// Sound settings
export const AMBIENT_SOUND_REL_PATH = join("..", "assets", "ambient.wav");
export const SINGLE_SOUND_REL_PATH = join("..", "assets", "fav0.wav");
export const MESSAGE_SOUND_REL_PATH = join("..", "assets", "message-short.mp3");
export const AMBIENT_VOLUME = 0.1;

// Calibration settings
export const CALIBRATION_SOLID_DURATION = 100_000; // ms

// Strip settings
export const MIN_PIXEL_INDEX = 0;
export const MAX_PIXEL_INDEX = 99;

// Detection buffer settings
export const DETECTION_BUFFER_TIME_SPAN = 500; // ms
export const DETECTION_BUFFER_CREATION_INTERVAL = 50; // ms

// Solid behavior settings
export const NODE_COLOR = [255, 255, 255]; // green, blue, red
export const NODE_SOLID_DURATION = 1_000_000; // ms
export const NODE_SOLID_DURATION_TEST = 500; // ms
export const NODE_SOLID_DURATION_DELAY = 1_000; // ms
export const NODE_SOLID_WIDTH = 1; // pixels

// Message behavior settings
export const MESSAGE_COLOR = [255, 0, 0]; // green, blue, red
export const MESSAGE_WIDTH = 10; // pixels
export const MESSAGE_PACE = 20; // pixels per second
export const MESSAGE_INCLUDE_BACKWARDS = true;
export const MESSAGE_DURATION_DIVIDER = 1; // 1 / (X * numberOfSegments)
export const MESSAGE_FADE_DURATION = 420; // ms
export const MESSAGE_FADE_POWER = 2; // higher is more aggressive
export const MESSAGE_FADE_IN_TIMEOUT_MULTIPLIER = 1.05;

// Single behavior settings
export const SINGLE_COLOR = [100, 50, 0];
export const SINGLE_WIDTH = 3; // pixels
export const SINGLE_LED_DURATION = 1_000; // ms
export const SINGLE_SOUND_MESSAGES = 3; // Send at most once every X messages
export const SINGLE_INCLUDE_BACKWARDS = false;

// JSON names
export const NODE_TO_STRIPS_MAP_REL_PATH = join(
  "..",
  "assets",
  "node-to-strips-map.json"
);
export const NODE_TO_CAMERA_MAP_REL_PATH = join(
  "..",
  "assets",
  "node-to-camera-map.json"
);
