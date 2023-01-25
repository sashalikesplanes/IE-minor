"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_TO_CAMERA_MAP_REL_PATH = exports.NODE_TO_STRIPS_MAP_REL_PATH = exports.SINGLE_INCLUDE_BACKWARDS = exports.SINGLE_SOUND_MESSAGES = exports.SINGLE_LED_DURATION = exports.SINGLE_WIDTH = exports.SINGLE_COLOR = exports.MESSAGE_FADE_IN_TIMEOUT_MULTIPLIER = exports.MESSAGE_FADE_POWER = exports.MESSAGE_FADE_DURATION = exports.MESSAGE_DURATION_DIVIDER = exports.MESSAGE_INCLUDE_BACKWARDS = exports.MESSAGE_PACE = exports.MESSAGE_WIDTH = exports.MESSAGE_COLOR = exports.PASSIVE_WIDTH = exports.PASSIVE_COLOR = exports.PASSIVE_MESSAGE_MAX_INTERVAL = exports.PASSIVE_MESSAGE_MIN_INTERVAL = exports.NODE_SOLID_FADE_DURATION = exports.NODE_SOLID_MAX_INTERVAL = exports.NODE_SOLID_MIN_INTERVAL = exports.NODE_SOLID_WIDTH = exports.NODE_SOLID_DURATION_DELAY = exports.NODE_SOLID_DURATION_TEST = exports.NODE_SOLID_DURATION = exports.NODE_COLOR = exports.DETECTION_BUFFER_CREATION_INTERVAL = exports.DETECTION_BUFFER_TIME_SPAN = exports.MAX_PIXEL_INDEX = exports.MIN_PIXEL_INDEX = exports.CALIBRATION_SOLID_DURATION = exports.SINGLE_VOLUME = exports.MESSAGE_VOLUME = exports.AMBIENT_VOLUME = exports.MESSAGE_SOUND_REL_PATH = exports.SINGLE_SOUND_REL_PATH = exports.AMBIENT_SOUND_REL_PATH = exports.SILENT_DETECTIONS = exports.WINDOW_CAM_PROBABILITY = exports.SCORE_THRESHOLD = exports.NMS_THRESHOLD = exports.SAVE_EACH_OUTPUT_IMAGE = exports.SAVE_OUTPUT_IMAGE = exports.USE_WINDOW_CAM = exports.USE_CORRIDOR_CAM = void 0;
const path_1 = require("path");
// KinectNN settings
exports.USE_CORRIDOR_CAM = true;
exports.USE_WINDOW_CAM = true;
exports.SAVE_OUTPUT_IMAGE = true;
exports.SAVE_EACH_OUTPUT_IMAGE = false;
exports.NMS_THRESHOLD = 0.5; // higher allows for more detectins of same hand
exports.SCORE_THRESHOLD = 0.4; // lower allows for less confident detections
exports.WINDOW_CAM_PROBABILITY = 0.6; // probability of applying NN to window cam
exports.SILENT_DETECTIONS = false;
// Sound settings
exports.AMBIENT_SOUND_REL_PATH = (0, path_1.join)("..", "assets", "ambient.wav");
exports.SINGLE_SOUND_REL_PATH = (0, path_1.join)("..", "assets", "individual.mp3");
exports.MESSAGE_SOUND_REL_PATH = (0, path_1.join)("..", "assets", "connectionnn.mp3");
exports.AMBIENT_VOLUME = 0.1;
exports.MESSAGE_VOLUME = 0.75;
exports.SINGLE_VOLUME = 0.75;
// Calibration settings
exports.CALIBRATION_SOLID_DURATION = 100000; // ms
// Strip settings
exports.MIN_PIXEL_INDEX = 0;
exports.MAX_PIXEL_INDEX = 99;
// Detection buffer settings
exports.DETECTION_BUFFER_TIME_SPAN = 250; // ms
exports.DETECTION_BUFFER_CREATION_INTERVAL = 50; // ms
// Solid behavior settings
exports.NODE_COLOR = [255, 255, 255]; // green, blue, red
exports.NODE_SOLID_DURATION = 1000000; // ms
exports.NODE_SOLID_DURATION_TEST = 500; // ms
exports.NODE_SOLID_DURATION_DELAY = 1000; // ms
exports.NODE_SOLID_WIDTH = 1; // pixels
exports.NODE_SOLID_MIN_INTERVAL = 10000; // ms
exports.NODE_SOLID_MAX_INTERVAL = 25000; // ms
exports.NODE_SOLID_FADE_DURATION = 5000; // ms
// Passive behavior settings
exports.PASSIVE_MESSAGE_MIN_INTERVAL = 25000; // ms
exports.PASSIVE_MESSAGE_MAX_INTERVAL = 100000; // ms
exports.PASSIVE_COLOR = [50, 50, 50];
exports.PASSIVE_WIDTH = 1.5; // pixels
// Message behavior settings
exports.MESSAGE_COLOR = [255, 0, 0]; // green, blue, red
exports.MESSAGE_WIDTH = 10; // pixels
exports.MESSAGE_PACE = 20; // pixels per second
exports.MESSAGE_INCLUDE_BACKWARDS = true;
exports.MESSAGE_DURATION_DIVIDER = 1; // 1 / (X * numberOfSegments)
exports.MESSAGE_FADE_DURATION = 420; // ms
exports.MESSAGE_FADE_POWER = 2; // higher is more aggressive
exports.MESSAGE_FADE_IN_TIMEOUT_MULTIPLIER = 1.05;
// Single behavior settings
exports.SINGLE_COLOR = [100, 50, 0];
exports.SINGLE_WIDTH = 3; // pixels
exports.SINGLE_LED_DURATION = 1000; // ms
exports.SINGLE_SOUND_MESSAGES = 3; // Send at most once every X messages
exports.SINGLE_INCLUDE_BACKWARDS = false;
// JSON names
exports.NODE_TO_STRIPS_MAP_REL_PATH = (0, path_1.join)("..", "assets", "node-to-strips-map.json");
exports.NODE_TO_CAMERA_MAP_REL_PATH = (0, path_1.join)("..", "assets", "node-to-camera-map.json");
