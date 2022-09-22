# SPDX-FileCopyrightText: 2018 Kattni Rembor for Adafruit Industries
#
# SPDX-License-Identifier: MIT

"""CircuitPython Essentials NeoPixel example"""
import time
import board
from rainbowio import colorwheel
import neopixel
import random
import digitalio
import rotaryio
import math
import json
import analogio


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

def blink():
    for i in range(10):
        pixels[i] = (255, 255, 255)
        pixels.show()

    
def get_eye_image(joystick_x, joystick_y):
    eye_x = convert_sensor_to_5(joystick_x)
    eye_y = convert_sensor_to_5(joystick_y)
    return 'eye' + str(eye_x) + str(eye_y)

# Setup for main loop
current_color = (random.randint(0, 128), random.randint(0, 128), random.randint(0, 128))
current_eye_image = 'eye00'
draw_eye(current_eye_image, current_color)

# Main loop
while True:
    # Check if eye has moved
    new_eye_image = get_eye_image(x_joystick.value, y_joystick.value)
    if new_eye_image != current_eye_image:
        current_eye_image = new_eye_image
        draw_eye(current_eye_image, current_color)

    # Check if eye has blinked
    if x_joystick.value > 65_000:
        current_color = (random.randint(0, 128), random.randint(0, 128), random.randint(0, 128))
        draw_eye(current_eye_image, current_color)
