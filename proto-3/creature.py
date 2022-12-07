import time
import board
import neopixel
import random
import math
import json
import analogio
from color_misc import WHITE, random_color
import pwmio
from adafruit_motor import servo


# IGNORE
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

# increase = True
# led_power = 255
# color = (1, 0, 0)


class Creature:

    # IGNORE
    def __init__(self):
        self.ecosystem = None
        # Setup joystick input axis
        self.x_joystick = analogio.AnalogIn(board.A4)
        self.y_joystick = analogio.AnalogIn(board.A5)

        # Setup 16x16 LED matrix, auto_write=False is needed to allow us to update several
        # LEDs at a time
        self.pixel_pin = board.D5
        self.num_pixels = 256
        print('ran init')
        self.pixels = neopixel.NeoPixel(self.pixel_pin, self.num_pixels, brightness=0.1, auto_write=False)

        # Setup servo
        self.pwm = pwmio.PWMOut(board.D13, duty_cycle=2**15, frequency=50)
        self.finger_servo = servo.Servo(self.pwm)
        self.current_color = random_color()
        self.next_color = random_color()
        self.current_eye_image = 'eye00'
        self.draw_eye(self.current_eye_image, self.current_color)

        # Setup for main loop
        # Keep track when to draw next blink frame
        self.last_blink_time = time.monotonic()
        self.BLINK_FRAME_INTERVAL = 0.0001 # seconds
        self.last_servo_update = time.monotonic()
        self.SERVO_UPDATE_INTERVAL = 0.1 # seconds, how often to update servo position
        self.eye_lids = EyeLids(self.pixels)


    def message(self, msg):
        global color
        print("recieved: " + str(msg))
        # Activate the buzzer if we recieve ping
        if msg == 'stinky stinna':
            self.start_blink(color=(0, 255, 0))

        if msg == 'blue bonanza':
            self.start_blink(color=(0, 0, 255))

        if msg == 'red rollercoaster':
            self.start_blink(color=(255, 0, 0))

    def sense(self):
        if self.x_joystick.value > 65_000:
            return True

    def start_blink(self, color=None):
        if self.eye_lids.current_frame == 0:
            if color == None:
                color = random_color()
            self.next_color = color
            self.last_blink_time = time.monotonic()
            self.eye_lids.next_frame()
            self.pixels.show()


    def draw_eye(self, file_name, current_color):
        # Load an image stored in a text file, as a list of pixels
        with open('images/' +  file_name + '.json', 'r') as f:
            image_pixels = json.load(f)
        for i in range(0, 256):
            self.pixels[i] = tuple(image_pixels[i])
            # (55, 137, 230) is the default eye color, replace it with custom eye color
            if tuple(image_pixels[i]) == (55, 137, 230):
                self.pixels[i] = current_color

    def convert_sensor_to_5(self, sensor_value):
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

    def get_eye_image(self, joystick_x, joystick_y):
        eye_x = self.convert_sensor_to_5(joystick_x)
        eye_y = self.convert_sensor_to_5(joystick_y)
        return 'eye' + str(eye_x) + str(eye_y)

    def joystick_to_angle(self, joystick_value):
        # Convert a value between 18k and 48k into a value between 0 and 180
        new_angle = (joystick_value - 18_000) / 166.67
        new_angle = new_angle / 2 + 45
        return min(180, max(0, new_angle))

    # One iteration of the creatures main loop
    def loop(self):
        global increase, led_power, color

        # If the button in pressed then send the message based on the slider value
        if self.sense():
            self.start_blink()


        new_eye_image = self.get_eye_image(self.x_joystick.value, self.y_joystick.value)
        if new_eye_image != self.current_eye_image:
            self.current_eye_image = new_eye_image
            self.draw_eye(self.current_eye_image, self.current_color)
            self.eye_lids.paint_frame()
            self.pixels.show()

        # Update the servo angle occasionally
        if time.monotonic() - self.last_servo_update > self.SERVO_UPDATE_INTERVAL:
            self.last_servo_update = time.monotonic()
            new_servo_angle = self.joystick_to_angle(self.x_joystick.value)
            self.finger_servo.angle = new_servo_angle

        if time.monotonic() - self.last_blink_time > self.BLINK_FRAME_INTERVAL and self.eye_lids.current_frame != 0:
            if self.eye_lids.current_frame == 7:
                self.current_color = self.next_color
                self.ecosystem.send_message(f'change_color###{self.current_color}')
            self.draw_eye(self.current_eye_image, self.current_color)
            self.eye_lids.next_frame()
            self.pixels.show()
            self.last_blink_time = time.monotonic()
