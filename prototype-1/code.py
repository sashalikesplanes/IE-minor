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

encoder = rotaryio.IncrementalEncoder(board.D4, board.D7)
last_position = None

button = digitalio.DigitalInOut(board.D10)
last_state = False

pixel_pin = board.D5
num_pixels = 256

pixels = neopixel.NeoPixel(pixel_pin, num_pixels, brightness=0.2, auto_write=True)

RED = (255, 0, 0)
YELLOW = (255, 150, 0)
GREEN = (0, 255, 0)
CYAN = (0, 255, 255)
BLUE = (0, 0, 255)
PURPLE = (180, 0, 255)
CLEAR = (0, 0, 0)

def color_strip(color, strips):
    for strip in strips:
        strip = strip % 16
        for i in range(strip*16, strip*16+16):
            pixels[i] = color

def clear_pixels():
    for i in range(0, 256):
        pixels[i] = (0, 0, 0)

def color_chase(color, wait):
    for i in range(num_pixels):
        pixels[i] = color
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
    pixels[random.randint(0,255)] = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
    pixels[random.randint(0,255)] = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
    pixels[random.randint(0,255)] = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))

last_position = -1
color_strip(CLEAR, range(0, 16))
#main loop
while True:
    # rainbow_cycle(0)  # Increase the number to slow down the rainbow
    #epilepsy()

# Poll the encoder position on each run through the loop.
    # If step change is dected: Convert to degrees & revolutions, print to serial.
    # The encoder has 24 steps per revolution, so 1 step equates to 15 degrees.
    position = encoder.position

    if position != last_position:
        if last_position == -1:
            last_position = 0
        print(position, last_position)
        if position - last_position > 0:
            color_strip(RED, range(last_position, position + 1))
        else:
            color_strip(CLEAR, range(last_position + 1, position + 1, -1))
    last_position = position

    # Poll the button state on each run through the loop.
    # If a button press is detected the position is reset to 0.
    if button.value is True and last_state is False:
        print("Reset Encoder Position...")
        encoder.position = 0
    last_state = button.value

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
