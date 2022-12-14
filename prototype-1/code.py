"""
Psike - interactive eye creature by Tazmin and Sasha - no copyrights restircted
"""
import time
import board
import neopixel
import random
import math
import json
import analogio
from color_misc import WHITE, random_color

# Setup joystick input axis
x_joystick = analogio.AnalogIn(board.A4)
y_joystick = analogio.AnalogIn(board.A5)

# Setup 16x16 LED matrix, auto_write=False is needed to allow us to update several
# LEDs at a time
pixel_pin = board.D5
num_pixels = 256
pixels = neopixel.NeoPixel(pixel_pin, num_pixels, brightness=0.1, auto_write=False)

def draw_eye(file_name, current_color):
    # Load an image stored in a text file, as a list of pixels
    with open('images/' +  file_name + '.json', 'r') as f:
        image_pixels = json.load(f)
    for i in range(0, 256):
        pixels[i] = tuple(image_pixels[i])
        # (55, 137, 230) is the default eye color, replace it with custom eye color
        if tuple(image_pixels[i]) == (55, 137, 230):
            pixels[i] = current_color

def convert_sensor_to_5(sensor_value):
# Scale the continuos value of joystick into 5 discrete levels
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
    # Store current state of eye lid and draw them
    # Consists of 8 key frames
    def __init__(self, pixels):
        self.pixels = pixels
        self.current_frame = 0 # 0 - completely open, 7 completely closed
        self.increasing_frame = True
        self.color_1 = random_color()
        self.color_2 = random_color()

        # Number of pixels not part of the eye, per step of blink
        self.PIXEL_OFFSET = [6, 6, 4, 3, 2, 2, 1, 1, 1, 1, 2, 2, 3, 4, 6, 6]


    def next_frame(self):
        # Calculate which should be the next frame
        if self.current_frame == 7:
            self.increasing_frame = False
        elif self.current_frame == 0:
            self.increasing_frame = True

        if self.increasing_frame:
            self.current_frame += 1
        else:
            self.current_frame -= 1

        self.paint_frame()

    def paint_frame(self):
        # Paint the current state of eyelids on top of the eye
        upper_lid_rows = range(0, self.current_frame + 1)
        lower_lid_rows = range(15, 15 - self.current_frame - 1, -1)

        # Select pixels to be colored for the upper lid
        upper_pixel_idx = []
        for row_idx in upper_lid_rows:
            for pixel in range(row_idx * 16 + self.PIXEL_OFFSET[row_idx], (row_idx + 1) * 16 - self.PIXEL_OFFSET[row_idx] + 1):
                upper_pixel_idx.append(pixel)

        # Same but for lower lid
        lower_pixel_idx = []
        for row_idx in lower_lid_rows:
            for pixel in range(row_idx * 16 + self.PIXEL_OFFSET[row_idx], (row_idx + 1) * 16 - self.PIXEL_OFFSET[row_idx] + 1):
                lower_pixel_idx.append(pixel)

        for i in upper_pixel_idx:
            self.pixels[i] = WHITE
        for i in lower_pixel_idx:
            self.pixels[i] = WHITE

    @property
    def color_mix(self):
        # Store the combo of the two eyelid colors
        return tuple([(channel_1 + channel_2) // 2 for channel_1, channel_2 in zip(self.color_1, self.color_2)])
    
def get_eye_image(joystick_x, joystick_y):
    # Select the correct image file for the current joystick position
    eye_x = convert_sensor_to_5(joystick_x)
    eye_y = convert_sensor_to_5(joystick_y)
    return 'eye' + str(eye_x) + str(eye_y)

# Setup for main loop
current_color = random_color() # first pupil color
current_eye_image = 'eye00' # centered eye
draw_eye(current_eye_image, current_color)

# Keep track when to draw next blink frame
last_blink_time = time.monotonic()
BLINK_FRAME_INTERVAL = 0.0001 # seconds
eye_lids = EyeLids(pixels)

# Main loop
while True:
    # Check if eye has moved
    new_eye_image = get_eye_image(x_joystick.value, y_joystick.value)
    if new_eye_image != current_eye_image:
        # Only draw new eye if it has changed, speeds up code
        current_eye_image = new_eye_image
        draw_eye(current_eye_image, current_color)
        eye_lids.paint_frame()
        # Show pixels only after all is drawn
        pixels.show()

    # Check if eye should start blinking, check if joystick is pressed and currently not blinking
    if x_joystick.value > 65_000 and eye_lids.current_frame == 0:
        last_blink_time = time.monotonic()
        eye_lids.next_frame()
        pixels.show()

    # Draw next blink frame if already blinking
    if time.monotonic() - last_blink_time > BLINK_FRAME_INTERVAL and eye_lids.current_frame != 0:
        if eye_lids.current_frame == 7:
            current_color = random_color()
        draw_eye(current_eye_image, current_color)
        eye_lids.next_frame()
        pixels.show()
        last_blink_time = time.monotonic()
