"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSIVE_WIDTH = exports.PASSIVE_COLOR = exports.PASSIVE_MESSAGE_MAX_INTERVAL = exports.PASSIVE_MESSAGE_MIN_INTERVAL = exports.HEARTBEAT_SOUND_DELAY = exports.HEARTBEAT_DIMNESS = exports.HEARTBEAT_SECOND_PULSE_DECAY_DURATION = exports.HEARTBEAT_SECOND_PULSE_ATTACK_DURATION = exports.HEARTBEAT_FIRST_PULSE_DECAY_DURATION = exports.HEARTBEAT_FIRST_PULSE_ATTACK_DURATION = exports.HEARTBEAT_LOOP_DURATION = exports.HEARTBEAT_DURATION = exports.TIME_MULTIPLIER = exports.NODE_SOLID_FADE_DURATION = exports.NODE_SOLID_MAX_INTERVAL = exports.NODE_SOLID_MIN_INTERVAL = exports.NODE_SOLID_WIDTH = exports.NODE_SOLID_DURATION_DELAY = exports.NODE_SOLID_DURATION_TEST = exports.NODE_SOLID_DURATION = exports.NODE_COLOR = exports.DETECTION_BUFFER_CREATION_INTERVAL = exports.DETECTION_BUFFER_TIME_SPAN = exports.MAX_PIXEL_INDEX = exports.MIN_PIXEL_INDEX = exports.CALIBRATION_SOLID_DURATION = exports.LOVE_DURATION = exports.LOVE_PACE = exports.LOVE_WIDTH = exports.LOVE_COLOR = exports.PLAY_NARRATION = exports.HEARTBEAT_VOLUME = exports.NARRATION_VOLUME = exports.SINGLE_VOLUME = exports.MESSAGE_VOLUME = exports.AMBIENT_VOLUME = exports.MESSAGE_CONSTANT_DURATION = exports.HEARTBEAT_SOUND_REL_PATH = exports.MESSAGE_SOUND_REL_PATH = exports.SINGLE_SOUND_REL_PATH = exports.AMBIENT_SOUND_REL_PATH = exports.SILENT_DETECTIONS = exports.WINDOW_CAM_PROBABILITY = exports.SCORE_THRESHOLD = exports.NMS_THRESHOLD = exports.SAVE_EACH_OUTPUT_IMAGE = exports.SAVE_OUTPUT_IMAGE = exports.USE_WINDOW_CAM = exports.USE_CORRIDOR_CAM = exports.DOUBLE_LENGTH_STRIP_INDECES = void 0;
exports.NODE_TO_CAMERA_MAP_REL_PATH = exports.NODE_TO_STRIPS_MAP_REL_PATH = exports.SINGLE_PULSE_MULTIPLIER = exports.SINGLE_INCLUDE_BACKWARDS = exports.SINGLE_SOUND_MESSAGES = exports.SINGLE_LED_DURATION = exports.SINGLE_WIDTH = exports.SINGLE_COLOR = exports.MESSAGE_FADE_IN_TIMEOUT_MULTIPLIER = exports.MESSAGE_FADE_POWER = exports.MESSAGE_FADE_DURATION = exports.MESSAGE_DURATION_DIVIDER = exports.MESSAGE_INCLUDE_BACKWARDS = exports.MESSAGE_PACE = exports.MESSAGE_WIDTH = exports.MESSAGE_MULTIPLIER = exports.MESSAGE_COLOR = void 0;
const path_1 = require("path");
exports.DOUBLE_LENGTH_STRIP_INDECES = [4];
// KinectNN settings
exports.USE_CORRIDOR_CAM = true;
exports.USE_WINDOW_CAM = true;
exports.SAVE_OUTPUT_IMAGE = true;
exports.SAVE_EACH_OUTPUT_IMAGE = false;
exports.NMS_THRESHOLD = 0.5; // higher allows for more detectins of same hand
exports.SCORE_THRESHOLD = 0.4; // lower allows for less confident detections
exports.WINDOW_CAM_PROBABILITY = 0.5; // probability of applying NN to window cam
exports.SILENT_DETECTIONS = true;
// Sound settings
exports.AMBIENT_SOUND_REL_PATH = (0, path_1.join)("..", "assets", "ambient.wav");
exports.SINGLE_SOUND_REL_PATH = (0, path_1.join)("..", "assets", "individual.mp3");
exports.MESSAGE_SOUND_REL_PATH = (0, path_1.join)("..", "assets", "connectionnn.mp3");
exports.HEARTBEAT_SOUND_REL_PATH = (0, path_1.join)("..", "assets", "heartbeat_short.mp3");
exports.MESSAGE_CONSTANT_DURATION = 5; // s
exports.AMBIENT_VOLUME = 0.5;
exports.MESSAGE_VOLUME = 1 * exports.AMBIENT_VOLUME;
exports.SINGLE_VOLUME = 2 * exports.AMBIENT_VOLUME;
exports.NARRATION_VOLUME = 0 * exports.AMBIENT_VOLUME;
exports.HEARTBEAT_VOLUME = 2 * exports.AMBIENT_VOLUME;
exports.PLAY_NARRATION = false;
// LOVE settings
exports.LOVE_COLOR = [20, 20, 100];
exports.LOVE_WIDTH = 3; // pixels
exports.LOVE_PACE = 20;
// How long to turn heartbeat love colored
exports.LOVE_DURATION = 10000; // ms
// Calibration settings
exports.CALIBRATION_SOLID_DURATION = 100000; // ms
// Strip settings
exports.MIN_PIXEL_INDEX = 0;
exports.MAX_PIXEL_INDEX = 99;
// Detection buffer settings
exports.DETECTION_BUFFER_TIME_SPAN = 250; // ms
exports.DETECTION_BUFFER_CREATION_INTERVAL = 50; // ms
// Solid behavior settings
exports.NODE_COLOR = [100, 100, 100]; // green, blue, red
exports.NODE_SOLID_DURATION = 1000000; // ms
exports.NODE_SOLID_DURATION_TEST = 500; // ms
exports.NODE_SOLID_DURATION_DELAY = 1000; // ms
exports.NODE_SOLID_WIDTH = 1; // pixels
exports.NODE_SOLID_MIN_INTERVAL = 10000; // ms
exports.NODE_SOLID_MAX_INTERVAL = 25000; // ms
exports.NODE_SOLID_FADE_DURATION = 5000; // ms
// HEartbeat behavior settings
// The total length of the heartbeat audio 
exports.TIME_MULTIPLIER = 4;
// How long the dim light lasts, (make it a bit longer in case the next event is late)
exports.HEARTBEAT_DURATION = 3.727 * exports.TIME_MULTIPLIER; // s
// How often the hearbeat sound repeats
exports.HEARTBEAT_LOOP_DURATION = 2.727 * exports.TIME_MULTIPLIER; // s
exports.HEARTBEAT_FIRST_PULSE_ATTACK_DURATION = 0.150 * exports.TIME_MULTIPLIER; // s
exports.HEARTBEAT_FIRST_PULSE_DECAY_DURATION = (0.350 - 0.150) * exports.TIME_MULTIPLIER; // s
exports.HEARTBEAT_SECOND_PULSE_ATTACK_DURATION = (0.500 - 0.350) * exports.TIME_MULTIPLIER; // s
exports.HEARTBEAT_SECOND_PULSE_DECAY_DURATION = (1.0 - 0.500) * exports.TIME_MULTIPLIER; // s
exports.HEARTBEAT_DIMNESS = 0.1; // 0-1
exports.HEARTBEAT_SOUND_DELAY = 0.085; // s
// Passive behavior settings
exports.PASSIVE_MESSAGE_MIN_INTERVAL = 25000; // ms
exports.PASSIVE_MESSAGE_MAX_INTERVAL = 100000; // ms
exports.PASSIVE_COLOR = [50, 50, 50];
exports.PASSIVE_WIDTH = 1.5; // pixels
// Message behavior settings
// NOT IT
exports.MESSAGE_COLOR = [255, 0, 0]; // green, blue, red
// how many messages exist connection
exports.MESSAGE_MULTIPLIER = 2;
exports.MESSAGE_WIDTH = 10; // pixels
exports.MESSAGE_PACE = 15; // pixels per second
exports.MESSAGE_INCLUDE_BACKWARDS = true;
exports.MESSAGE_DURATION_DIVIDER = 1 * exports.TIME_MULTIPLIER; // 1 / (X * numberOfSegments)
exports.MESSAGE_FADE_DURATION = 420; // ms
exports.MESSAGE_FADE_POWER = 2; // higher is more aggressive
exports.MESSAGE_FADE_IN_TIMEOUT_MULTIPLIER = 1.05;
// Single behavior settings
// NOT IT
exports.SINGLE_COLOR = [100, 50, 0];
exports.SINGLE_WIDTH = 3; // pixels
exports.SINGLE_LED_DURATION = 2000; // ms
exports.SINGLE_SOUND_MESSAGES = 3; // Send at most once every X messages
exports.SINGLE_INCLUDE_BACKWARDS = false;
exports.SINGLE_PULSE_MULTIPLIER = 1;
// JSON names
exports.NODE_TO_STRIPS_MAP_REL_PATH = (0, path_1.join)("..", "assets", "node-to-strips-map.json");
exports.NODE_TO_CAMERA_MAP_REL_PATH = (0, path_1.join)("..", "assets", "node-to-camera-map.json");
