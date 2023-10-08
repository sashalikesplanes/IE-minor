from math import sin, pi
from time import monotonic
from configs import NODE_COLOR
from configs import INTENSITY_UPDATE_THRESHOLD

def create_constant_behaviour(strips, behaviours, start_time, constant_config):
    duration = (constant_config["duration"]) / 1000
    fadein_duration = (constant_config["fadein_duration"]) / 1000
    fadeout_duration = (constant_config["fadeout_duration"]) / 1000
    power = constant_config["fade_power"]

    def get_intensity(elapsed_time):
        if elapsed_time < fadein_duration and fadein_duration > 0:
            return elapsed_time ** power / fadein_duration ** power
        elif elapsed_time > duration - fadeout_duration and elapsed_time < duration and fadeout_duration > 0:
            return (duration - elapsed_time) ** power / fadeout_duration ** power
        elif elapsed_time > duration:
            return 0
        return 1

    def constant_behaviour(current_time):
        elapsed_time = current_time - start_time
        current_intensity = get_intensity(elapsed_time)
        for pixel in constant_config["pixels"]:
            strips[pixel["strip_idx"]][pixel["pixel_idx"]] = (
                strips[pixel["strip_idx"]][pixel["pixel_idx"]][0] * (1 - current_intensity) +
                constant_config["color"][0] * current_intensity,
                strips[pixel["strip_idx"]][pixel["pixel_idx"]][1] * (1 - current_intensity) +
                constant_config["color"][1] * current_intensity,
                strips[pixel["strip_idx"]][pixel["pixel_idx"]][2] * (1 - current_intensity) +
                constant_config["color"][2] * current_intensity
            )

        if elapsed_time > duration:
            if constant_config["next"] is not None:
                behaviours.append({'type': constant_config['type'], 'fn': create_constant_behaviour(
                    strips, behaviours, monotonic(), constant_config["next"])})
            return False
        return True

    return constant_behaviour


def create_message_behaviour(strips, behaviours, start_time, message_config):
    duration = (abs( (message_config["end_idx"] - message_config["start_idx"])) + 1 + message_config['message_width'] / 2) / message_config["pace"]

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
            if strips[message_config["strip_idx"]][pixel_idx] == NODE_COLOR:
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
                behaviours.append({'type': message_config['type'], 'fn': create_message_behaviour(
                    strips, behaviours, monotonic(), message_config["next"])})

            return False
        return True

    return message_behaviour
