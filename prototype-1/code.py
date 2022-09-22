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

encoder = rotaryio.IncrementalEncoder(board.D4, board.D7)
last_position = None

button = digitalio.DigitalInOut(board.D10)
last_state = False

pixel_pin = board.D5
num_pixels = 256

pixels = neopixel.NeoPixel(pixel_pin, num_pixels, brightness=1.0, auto_write=False)

RED = (255, 0, 0)
MINUS_RED = (-255, 0, 0)
YELLOW = (255, 150, 0)
GREEN = (0, 255, 0)
CYAN = (0, 255, 255)
BLUE = (0, 0, 255)
MINUS_BLUE = (0, 0, -255)
PURPLE = (180, 0, 255)
CLEAR = (0, 0, 0)

def colour_strip(colour, strips):
    for strip in strips:
        for i in range(strip*16, strip*16+16):
            previous_colour = pixels[i]
            new_colour = tuple([max(0, min(255, prev_colour_channel + new_colour_channel)) for prev_colour_channel, new_colour_channel in zip(previous_colour, colour)])
            pixels[i] = new_colour

            if colour == CLEAR:
                pixels[i] = CLEAR

def clear_pixels():
    for i in range(0, 256):
        pixels[i] = (0, 0, 0)

def colour_chase(colour, wait):
    for i in range(num_pixels):
        pixels[i] = colour
        time.sleep(wait)
        pixels.show()
    time.sleep(0.5)

def rainbow_cycle(wait):
    for j in range(255):
        for i in range(num_pixels):
            rc_index = (i * 256 // num_pixels) + j
            pixels[i] = colorwheel(rc_index & 255)
            if i in eyes_pix or i in smile_pix:
                pixels[i] = (255, 255, 255)
        pixels.show()
        time.sleep(wait)

def epilepsy():
    for i in range(0, 256):
        pixels[i] = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
    pixels.show()

def draw_image(file_name):
    with open('images/' +  file_name + '.json', 'r') as f:
        image_pixels = json.load(f)
    for i in range(0, 256):
        pixels[i] = tuple(image_pixels[i])
    pixels.show()

def convert_sensor_to_5(sensor_value):
    if sensor_value < 24_000:
        return -2
    elif sensor_value < 30_000:
        return -1
    elif sensor_value < 36_000:
        return 0
    elif sensor_value < 42_000:
        return 1
    else:
        return 2

    
def get_eye_image(joystick_x, joystick_y):
    eye_x = convert_sensor_to_5(joystick_x)
    eye_y = convert_sensor_to_5(joystick_y)
    return 'eye' + str(eye_x) + str(eye_y)

last_position = 0
colour_strip(CLEAR, range(0, 16))
colour_1 = (random.randint(0, 128), random.randint(0, 128), random.randint(0, 128))
colour_2 = (random.randint(0, 128), random.randint(0, 128), random.randint(0, 128))
minus_colour_1 = tuple([-channel for channel in colour_1])
minus_colour_2 = tuple([-channel for channel in colour_2])
# colour_strip(RED, [0])
# colour_strip(BLUE, [15])
#main loop
draw_image('open_eye4')
while True:
    draw_image(get_eye_image(x_joystick, y_joystick))
    print(x_joystick.value, y_joystick.value)
    time.sleep(0.01)
    # epilepsy()
    # Fit encoder within bounds
    # position 0 is all off
    # position = encoder.position
    #
    # if position > 15:
    #     position = 15
    #     encoder.position = 15
    # elif position < 0:
    #     position = 0
    #     encoder.position = 0
    #
    # if position != last_position:
    #     print(position, last_position)
    #     if position - last_position > 0:
    #         colour_strip(RED, range(last_position, position + 1))
    #         colour_strip(BLUE, range(15 - last_position, 15 - position - 1, -1))
    #         pixels.show()
    #     else:
    #         colour_strip(MINUS_RED, range(last_position, position, -1))
    #         colour_strip(MINUS_BLUE, range(15 - last_position, 15 - position))
    #         pixels.show()
    # last_position = position

    # if button.value is True and last_state is False:
    #     print("Reset Encoder Position...")
    #     encoder.position = 0
    # last_state = button.value

eyes_pix = [
    52,
    53,
    58,
    59,
    52 + 16,
    53 + 16,
    58 + 16,
    59 + 16,
    52 + 32,
    53 + 32,
    58 + 32,
    59 + 32,
]
smile_pix = [
    125,
    114,
    114 + 16,
    125 + 16,
    114 + 32,
    125 + 32,
    114 + 49,
    125 + 47,
    114 + 66,
    125 + 62,
    125 + 73,
    125 + 74,
    125 + 72,
    125 + 76,
    125 + 75,
    125 + 77,
]
