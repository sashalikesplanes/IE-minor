# SPDX-FileCopyrightText: 2018 Kattni Rembor for Adafruit Industries
#
# SPDX-License-Identifier: MIT

"""CircuitPython Essentials NeoPixel example"""
import time
import board
import neopixel
import random
import math
import json
import analogio
from color_misc import WHITE


x_joystick = analogio.AnalogIn(board.A4)
y_joystick = analogio.AnalogIn(board.A5)

pixel_pin = board.D5
num_pixels = 256
pixels = neopixel.NeoPixel(pixel_pin, num_pixels, brightness=0.25, auto_write=False)


def draw_eye(file_name, current_color):
    with open('images/' +  file_name + '.json', 'r') as f:
        image_pixels = json.load(f)
    for i in range(0, 256):
        pixels[i] = tuple(image_pixels[i])
        if tuple(image_pixels[i]) == (55, 137, 230):
            pixels[i] = current_color

    pixels.show()

def random_color():
    return (random.randint(0, 128), random.randint(0, 128), random.randint(0, 128))

def convert_sensor_to_5(sensor_value):
    if sensor_value < 24_000:
        return -2
    elif sensor_value < 30_000:
        return -1
    elif sensor_value < 36_000 or sensor_value > 65_000:
        return 0
    elif sensor_value < 42_000:
        return 1
    else:
        return 2

class EyeLids:
    def __init__(self, pixels):
        self.pixels = pixels
        self.current_frame = 0 # 0 - completely open, 7 completely closed
        self.increasing_frame = True
        self.color_1 = random_color()
        self.color_2 = random_color()

        # Number of pixels not part of the eye, per step of blink
        self.PIXEL_OFFSET = [6, 6, 4, 3, 2, 2, 1, 1]


    def next_frame(self):
        # Calculate the next frame
        if self.current_frame == 7:
            self.increasing_frame = False
        elif self.current_frame == 0:
            self.increasing_frame = True

        if self.increasing_frame:
            self.current_frame += 1
        else:
            self.current_frame -= 1

        self._paint_frame()

    def _paint_frame(self):
        # paint the white dash
        upper_lid_idx = self.current_frame
        lower_lid_idx = 15 - self.current_frame

        upper_pixel_idx = range(upper_lid_idx * 16 + self.PIXEL_OFFSET[self.current_frame], (upper_lid_idx + 1) * 16 - self.PIXEL_OFFSET[self.current_frame] + 1)
        lower_pixel_idx = range(lower_lid_idx * 16 + self.PIXEL_OFFSET[self.current_frame], (lower_lid_idx + 1) * 16 - self.PIXEL_OFFSET[self.current_frame] + 1)
        for i in upper_pixel_idx:
            self.pixels[i] = WHITE
        for i in lower_pixel_idx:
            self.pixels[i] = WHITE

        pixels.show()


    @property
    def color_mix(self):
        return tuple([(channel_1 + channel_2) // 2 for channel_1, channel_2 in zip(self.color_1, self.color_2)])
        

def blink():
    for i in range(10):
        pixels[i] = (255, 255, 255)
        pixels.show()

    
def get_eye_image(joystick_x, joystick_y):
    eye_x = convert_sensor_to_5(joystick_x)
    eye_y = convert_sensor_to_5(joystick_y)
    return 'eye' + str(eye_x) + str(eye_y)

# Setup for main loop
current_color = random_color()
current_eye_image = 'eye00'
draw_eye(current_eye_image, current_color)

# Keep track when to draw next blink frame
last_blink_time = time.monotonic()
BLINK_FRAME_INTERVAL = 0.1 # seconds
eye_lids = EyeLids(pixels)

# Main loop
while True:
    # Check if eye has moved
    new_eye_image = get_eye_image(x_joystick.value, y_joystick.value)
    if new_eye_image != current_eye_image:
        current_eye_image = new_eye_image
        draw_eye(current_eye_image, current_color)

    # Check if eye should start blinking
    if x_joystick.value > 65_000 and eye_lids.current_frame == 0:
        # current_color = (random.randint(0, 128), random.randint(0, 128), random.randint(0, 128))
        # draw_eye(current_eye_image, current_color)
        last_blink_time = time.monotonic()
        eye_lids.next_frame()

    if time.monotonic() - last_blink_time > BLINK_FRAME_INTERVAL and eye_lids.current_frame != 0:
        draw_eye(current_eye_image, current_color)
        eye_lids.next_frame()
        last_blink_time = time.monotonic()
