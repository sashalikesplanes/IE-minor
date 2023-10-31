import { join } from "path";

export const DOUBLE_LENGTH_STRIP_INDECES = [4]

// KinectNN settings
export const USE_CORRIDOR_CAM = true;
export const USE_WINDOW_CAM = true;
export const SAVE_OUTPUT_IMAGE = true;
export const SAVE_EACH_OUTPUT_IMAGE = false;
export const NMS_THRESHOLD = 0.5; // higher allows for more detectins of same hand
export const SCORE_THRESHOLD = 0.4; // lower allows for less confident detections
export const WINDOW_CAM_PROBABILITY = 0.5; // probability of applying NN to window cam
export const SILENT_DETECTIONS = true;

// Sound settings
export const AMBIENT_SOUND_REL_PATH = join("..", "assets", "ambient.wav");
export const SINGLE_SOUND_REL_PATH = join("..", "assets", "individual.mp3");
export const MESSAGE_SOUND_REL_PATH = join("..", "assets", "connectionnn.mp3");
export const HEARTBEAT_SOUND_REL_PATH = join("..", "assets", "heartbeat_short.mp3");
export const MESSAGE_CONSTANT_DURATION = 5; // s
export const AMBIENT_VOLUME = 0.5;
export const MESSAGE_VOLUME = 1 * AMBIENT_VOLUME;
export const SINGLE_VOLUME = 2 * AMBIENT_VOLUME;
export const NARRATION_VOLUME = 0 * AMBIENT_VOLUME;
export const HEARTBEAT_VOLUME = 2 * AMBIENT_VOLUME;
export const PLAY_NARRATION = false;

// LOVE settings
export const LOVE_COLOR = [20, 20, 100];
export const LOVE_WIDTH = 3; // pixels
export const LOVE_PACE = 20;
// How long to turn heartbeat love colored
export const LOVE_DURATION = 10_000; // ms

// Calibration settings
export const CALIBRATION_SOLID_DURATION = 100_000; // ms

// Strip settings
export const MIN_PIXEL_INDEX = 0;
export const MAX_PIXEL_INDEX = 99;

// Detection buffer settings
export const DETECTION_BUFFER_TIME_SPAN = 250; // ms
export const DETECTION_BUFFER_CREATION_INTERVAL = 50; // ms

// Solid behavior settings
export const NODE_COLOR = [100, 100, 100]; // green, blue, red
export const NODE_SOLID_DURATION = 1_000_000; // ms
export const NODE_SOLID_DURATION_TEST = 500; // ms
export const NODE_SOLID_DURATION_DELAY = 1_000; // ms
export const NODE_SOLID_WIDTH = 1; // pixels
export const NODE_SOLID_MIN_INTERVAL = 10_000; // ms
export const NODE_SOLID_MAX_INTERVAL = 25_000; // ms
export const NODE_SOLID_FADE_DURATION = 5_000; // ms

// HEartbeat behavior settings
// The total length of the heartbeat audio 
export const TIME_MULTIPLIER = 4;
// How long the dim light lasts, (make it a bit longer in case the next event is late)
export const HEARTBEAT_DURATION = 3.727 * TIME_MULTIPLIER; // s
// How often the hearbeat sound repeats
export const HEARTBEAT_LOOP_DURATION = 2.727 * TIME_MULTIPLIER// s
export const HEARTBEAT_FIRST_PULSE_ATTACK_DURATION = 0.150 * TIME_MULTIPLIER; // s
export const HEARTBEAT_FIRST_PULSE_DECAY_DURATION = (0.350 - 0.150) * TIME_MULTIPLIER; // s
export const HEARTBEAT_SECOND_PULSE_ATTACK_DURATION = (0.500 - 0.350) * TIME_MULTIPLIER; // s
export const HEARTBEAT_SECOND_PULSE_DECAY_DURATION = (1.0 - 0.500) * TIME_MULTIPLIER; // s
export const HEARTBEAT_DIMNESS = 0.1; // 0-1
export const HEARTBEAT_SOUND_DELAY = 0.085; // s

// Passive behavior settings
export const PASSIVE_MESSAGE_MIN_INTERVAL = 25_000; // ms
export const PASSIVE_MESSAGE_MAX_INTERVAL = 100_000; // ms
export const PASSIVE_COLOR = [50, 50, 50];
export const PASSIVE_WIDTH = 1.5; // pixels

// Message behavior settings
// NOT IT
export const MESSAGE_COLOR = [255, 0, 0]; // green, blue, red
// how many messages exist connection
export const MESSAGE_MULTIPLIER = 2;
export const MESSAGE_WIDTH = 10; // pixels
export const MESSAGE_PACE = 15; // pixels per second
export const MESSAGE_INCLUDE_BACKWARDS = true;
export const MESSAGE_DURATION_DIVIDER = 1 * TIME_MULTIPLIER; // 1 / (X * numberOfSegments)
export const MESSAGE_FADE_DURATION = 420; // ms
export const MESSAGE_FADE_POWER = 2; // higher is more aggressive
export const MESSAGE_FADE_IN_TIMEOUT_MULTIPLIER = 1.05;

// Single behavior settings
// NOT IT
export const SINGLE_COLOR = [100, 50, 0];
export const SINGLE_WIDTH = 3; // pixels
export const SINGLE_LED_DURATION = 2_000; // ms
export const SINGLE_SOUND_MESSAGES = 3; // Send at most once every X messages
export const SINGLE_INCLUDE_BACKWARDS = false;
export const SINGLE_PULSE_MULTIPLIER = 1;

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
