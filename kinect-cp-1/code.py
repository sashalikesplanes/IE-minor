import time
import board
import analogio
import digitalio
import neopixel
import random
from analogio import AnalogIn
from components.button import Button
import usb_cdc
import time
import json

dataPort = usb_cdc.data

RED = (255, 0, 0)
YELLOW = (255, 150, 0)
PINK = (255, 51, 153)
GREEN = (0, 255, 0)
CYAN = (0, 255, 255)
BLUE = (0, 0, 255)
PURPLE = (180, 0, 255)
PINK = (255, 51, 153)
WHITE = (255, 255, 255)
OFF = (0, 0, 0)


class Pulse:
    def __init__(self, start_idx, num_pixels, pace_pixels_per_second, width, color):
        self.start_time = time.monotonic()
        self.start_idx = start_idx
        self.pos_peak = start_idx
        self.neg_peak = start_idx
        self.pace_pixels_per_second = pace_pixels_per_second
        self.num_pixels = num_pixels
        self.width = width
        self.color = color

        self.is_done = False

    def update(self):
        # based on the difference between start time, current time and pace
        # Calculate the new values for the pos and neg peaks

        self.pos_peak = self.start_idx + self.pace_pixels_per_second * (
            time.monotonic() - self.start_time
        )
        self.neg_peak = self.start_idx - self.pace_pixels_per_second * (
            time.monotonic() - self.start_time
        )

        if (
            self.neg_peak - self.width / 2 < 1
            and self.pos_peak + self.width / 2 > self.num_pixels - 2
        ):
            self.is_done = True
            return


class Strip:
    def __init__(self, pin, num_pixels):
        self.pixels = neopixel.NeoPixel(
            pin, num_pixels, brightness=1, auto_write=False, pixel_order=neopixel.RGB
        )
        self.pixels.fill(OFF)
        self.pixels.show()

        self.pixel_pace_per_second = 20
        self.width = 4
        self.exp_const = 0.5

        self.num_pixels = num_pixels
        self.color = WHITE

        self.current_pulses = []

    def start_pulse(self, start_idx, color):
        self.current_pulses.append(
            Pulse(
                start_idx,
                self.num_pixels,
                self.pixel_pace_per_second,
                self.width,
                color,
            )
        )

    def exp_color_mix(self, color1, color2, exp_const):
        return tuple(
            [
                int(c1 * exp_const + c2 * (1 - exp_const))
                for c1, c2 in zip(color1, color2)
            ]
        )

    def update(self):
        self.current_pulses = list(
            filter(lambda pulse: not pulse.is_done, self.current_pulses)
        )

        pixels_to_turn_on = set()
        for p in self.current_pulses:
            p.update()
            if p.is_done:
                continue
            neg_peak_pixels = range(
                int(p.neg_peak - p.width / 2), int(p.neg_peak + p.width / 2)
            )
            pos_peak_pixels = range(
                int(p.pos_peak - p.width / 2), int(p.pos_peak + p.width / 2)
            )
            pixels_to_turn_on.update([(i, p.color) for i in neg_peak_pixels])
            pixels_to_turn_on.update([(i, p.color) for i in pos_peak_pixels])

        self.pixels.fill(OFF)

        for pix in pixels_to_turn_on:
            if pix[0] < 0 or pix[0] > 99:
                continue
            self.pixels[pix[0]] = self.exp_color_mix(
                # tuple([random.randint(0, 255) for i in range(3)]),
                pix[1],
                self.pixels[pix[0]],
                self.exp_const,
            )

        self.pixels.show()


strips = [
    Strip(board.D1, 100),
    Strip(board.D3, 100),
    Strip(board.D2, 100),
    Strip(board.D7, 100),
]

buttons = [
    Button(port=board.D10),
    # Button(port=board.D13),
    # Button(port=board.D7),
    # Button(port=board.A0),
    # Button(port=board.A2),
    # Button(port=board.A4),
    # Button(port=board.D1),
]

button_start_map = [
    (None, 10),  # button 0
    (None, 20),  # button 1
    (None, 25),  # button 2
    (None, 28),  # button 3
    (None, 64),  # button 4
    (15, 70),  # button 5
    (6, None),  # button 6
    # (33, None),  # button 7
]

# --- Main loop
TIMEOUT = 2  # seconds
last_trigger = time.monotonic() - TIMEOUT

# Maps a node index onto its position on each strip
nodeMap = [(None, None, None, None), (None, None, None, None)]
while True:
    if time.monotonic() - last_trigger > TIMEOUT:
        strips[0].start_pulse(10, WHITE)
        last_trigger = time.monotonic()
    data = None
    activeNodes = []
    if dataPort.in_waiting > 0:
        data = dataPort.readline()

    activeNodes = json.loads(data) if data else []

    for node in activeNodes:
        for strip_idx, start_idx in enumerate(nodeMap[node]):
            strips[strip_idx].start_pulse(start_idx, WHITE)
        print(node)

    for s in strips:
        s.update()

    # for i, b in enumerate(buttons):
    #     if b.sense_release():
    #         last_trigger = time.monotonic()
    #         # start a random pulse in each strip
    #         strips[0].start_pulse(30, WHITE)
    #         strips[3].start_pulse(50, WHITE)
    #         for s in strips:
    #             for p in s.current_pulses:
    #                 p.color = WHITE

    #     for s in strips:
    #         if random.random() < 0.02:
    #             print("light")
    #             if time.monotonic() - last_trigger > TIMEOUT:
    #                 s.start_pulse(random.randint(20, 80), RED)
    #             else:
    #                 s.start_pulse(random.randint(20, 80), WHITE)
    # if b.sense_release() or random.random() < 0.01:
    #     start_pixs = button_start_map[i]
    #     for j, start_pix in enumerate(start_pixs):
    #         if start_pix is None:
    #             continue
    #         strips[j].start_pulse(start_pix)
