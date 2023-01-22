from math import sin, pi
from time import monotonic

from configs import INTENSITY_UPDATE_THRESHOLD


def create_solid_behaviour(strips, behaviours, start_time, solid_config):
    duration = (solid_config["duration"]) / 990

    def get_intensity(elapsed_time):
        return 1

    def solid_behaviour(current_time):
        elapsed_time = current_time - start_time
        for pixel in solid_config["pixels"]:
            strips[pixel["strip_idx"]][pixel["pixel_idx"]] = (
                strips[pixel["strip_idx"]][pixel["pixel_idx"]][0] +
                solid_config["color"][0] * get_intensity(elapsed_time),
                strips[pixel["strip_idx"]][pixel["pixel_idx"]][1] +
                solid_config["color"][1] * get_intensity(elapsed_time),
                strips[pixel["strip_idx"]][pixel["pixel_idx"]][2] +
                solid_config["color"][2] * get_intensity(elapsed_time)
            )

        if elapsed_time > duration:
            return False
        return True

    return solid_behaviour


def create_message_behaviour(strips, behaviours, start_time, message_config):
    duration = (abs(
        (message_config["end_idx"] - message_config["start_idx"])) + 1 + message_config['message_width'] / 2) / message_config["pace"]

    def get_intensity(elapsed_time, pixel_offset):
        if pixel_offset > elapsed_time * message_config["pace"]:
            return 0
        if pixel_offset < elapsed_time * message_config["pace"] - message_config["message_width"] / 2:
            return 0
        return -sin((pixel_offset - elapsed_time * message_config["pace"]) / message_config["message_width"] * pi * 2)

    def message_behaviour(current_time):
        elapsed_time = current_time - start_time

        pixel_range = range(
            message_config["start_idx"], message_config["end_idx"] + 1)

        if message_config["start_idx"] > message_config["end_idx"]:
            pixel_range = range(
                message_config["start_idx"], message_config["end_idx"] - 1, -1)

        for pixel_idx in pixel_range:
            pixel_offset = pixel_idx - message_config["start_idx"]

            if message_config["start_idx"] > message_config["end_idx"]:
                pixel_offset = message_config["start_idx"] - pixel_idx

            intensity = get_intensity(elapsed_time, pixel_offset)

            # If the intensity is 0, don't bother updating the strip
            if intensity < INTENSITY_UPDATE_THRESHOLD:
                continue

            # If the color at the pixel is NODE_COLOR, then reset it
            if strips[message_config["strip_idx"]][pixel_idx] == (0, 0, 0):
                strips[message_config["strip_idx"]][pixel_idx] = (
                    message_config["color"][0] * intensity,
                    message_config["color"][1] * intensity,
                    message_config["color"][2] * intensity
                )
                continue

            strips[message_config["strip_idx"]][pixel_idx] = (
                strips[message_config["strip_idx"]][pixel_idx][0] +
                message_config["color"][0] * intensity,
                strips[message_config["strip_idx"]][pixel_idx][1] +
                message_config["color"][1] * intensity,
                strips[message_config["strip_idx"]][pixel_idx][2] +
                message_config["color"][2] * intensity
            )

        if elapsed_time > duration:
            if message_config["next"] is not None:
                behaviours.append(create_message_behaviour(
                    strips, behaviours, monotonic(), message_config["next"]))

            return False
        return True

    return message_behaviour
