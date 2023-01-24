"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_TO_CAMERA_MAP_NAME = exports.NODE_TO_STRIPS_MAP_NAME = exports.SINGLE_INCLUDE_BACKWARDS = exports.SINGLE_DURATION = exports.SINGLE_WIDTH = exports.SINGLE_COLOR = exports.MESSAGE_INCLUDE_BACKWARDS = exports.MESSAGE_PACE = exports.MESSAGE_WIDTH = exports.MESSAGE_COLOR = exports.NODE_SOLID_WIDTH = exports.NODE_SOLID_DURATION_DELAY = exports.NODE_SOLID_DURATION_TEST = exports.NODE_SOLID_DURATION = exports.NODE_COLOR = exports.DETECTION_BUFFER_CREATION_INTERVAL = exports.DETECTION_BUFFER_TIME_SPAN = exports.MAX_PIXEL_INDEX = exports.MIN_PIXEL_INDEX = exports.CALIBRATION_SOLID_DURATION = exports.SILENT_DETECTIONS = exports.WINDOW_CAM_PROBABILITY = exports.SCORE_THRESHOLD = exports.NMS_THRESHOLD = exports.SAVE_EACH_OUTPUT_IMAGE = exports.SAVE_OUTPUT_IMAGE = exports.USE_WINDOW_CAM = exports.USE_CORRIDOR_CAM = void 0;
// KinectNN settings
exports.USE_CORRIDOR_CAM = true;
exports.USE_WINDOW_CAM = true;
exports.SAVE_OUTPUT_IMAGE = true;
exports.SAVE_EACH_OUTPUT_IMAGE = false;
exports.NMS_THRESHOLD = 0.9; // higher allows for more detectins of same hand
exports.SCORE_THRESHOLD = 0.3; // lower allows for less confident detections
exports.WINDOW_CAM_PROBABILITY = 0.5; // probability of applying NN to window cam
exports.SILENT_DETECTIONS = false;
// Calibration settings
exports.CALIBRATION_SOLID_DURATION = 100000; // ms
// Strip settings
exports.MIN_PIXEL_INDEX = 0;
exports.MAX_PIXEL_INDEX = 99;
// Detection buffer settings
exports.DETECTION_BUFFER_TIME_SPAN = 500; // ms
exports.DETECTION_BUFFER_CREATION_INTERVAL = 50; // ms
// Solid behavior settings
exports.NODE_COLOR = [255, 255, 255]; // green, blue, red
exports.NODE_SOLID_DURATION = 1000000; // ms
exports.NODE_SOLID_DURATION_TEST = 500; // ms
exports.NODE_SOLID_DURATION_DELAY = 1000; // ms
exports.NODE_SOLID_WIDTH = 1; // pixels
// Message behavior settings
exports.MESSAGE_COLOR = [255, 0, 0]; // green, blue, red
exports.MESSAGE_WIDTH = 10; // pixels
exports.MESSAGE_PACE = 20; // pixels per second
exports.MESSAGE_INCLUDE_BACKWARDS = true;
// Single behavior settings
exports.SINGLE_COLOR = [100, 50, 0];
exports.SINGLE_WIDTH = 3; // pixels
exports.SINGLE_DURATION = 1000; // msg
exports.SINGLE_INCLUDE_BACKWARDS = false;
// JSON names
exports.NODE_TO_STRIPS_MAP_NAME = "node-to-strips-map.json";
exports.NODE_TO_CAMERA_MAP_NAME = "node-to-camera-map.json";
