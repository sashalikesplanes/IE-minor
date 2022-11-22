import busio
import board
import time
import json
from neopixel import NeoPixel
import math


print("I am LED strip controller")

time_multiple = 2


def global_sin():
    return math.sin(time.monotonic() * time_multiple)


def global_cos():
    return 0.5 * (math.cos(time.monotonic() * time_multiple) + 1)


def map_float_to_int(f, min, max):
    # If float is 0 return min, if float is 1 return max
    return math.floor(f * (max - min + 1))


class Strip:
    def __init__(self, pixel_pin, num_pixels, exp_const=0.05):
        self.pixels = NeoPixel(pixel_pin, num_pixels, brightness=1.0, auto_write=False)
        self.num_pixels = num_pixels

        self.pos_color = (255, 0, 0)
        self.neg_color = (0, 255, 0)
        self.neutral_color = (0, 0, 0)

        self.exp_const = exp_const

        for i, _ in enumerate(self.pixels):
            self.pixels[i] = (0, 0, 0)
        self.pixels.show()

    def update(self):
        # Determine which signal based on the sin
        cur_sin = global_sin()
        cur_color = self.pos_color
        if cur_sin < 0:
            cur_color = self.neg_color

        # Determine position of signal based on cos
        cur_cos = global_cos()
        lit_pixel_idx = map_float_to_int(cur_cos, 0, self.num_pixels - 1)

        for i, _ in enumerate(self.pixels):
            if i == lit_pixel_idx:
                self.pixels[i] = self._exp_average_color(cur_color, self.pixels[i])
            else:
                self.pixels[i] = self._exp_average_color(
                    self.neutral_color, self.pixels[i]
                )

        self.pixels.show()

    def set_state(self, new_state):
        self.pos_color = tuple(new_state["pos"])
        self.neg_color = tuple(new_state["neg"])

    def _exp_average_color(self, new_color, old_color):
        return tuple(
            [
                min(255, max(0, int(self.exp_const * c1 + (1 - self.exp_const) * c2)))
                for c1, c2 in zip(new_color, old_color)
            ]
        )


strip_configs = [{"pin": board.D10, "num": 9}, {"pin": board.D13, "num": 16}]
strips = [Strip(c["pin"], c["num"], exp_const=0.05) for c in strip_configs]

uart = busio.UART(
    board.D1, board.D0, baudrate=9600, timeout=1, parity=busio.UART.Parity.EVEN
)
while True:
    if uart.in_waiting > 0:
        data = uart.readline()
        try:
            state = json.loads(data)
            for i, strip_state in enumerate(state["strips"]):
                strips[i].set_state(strip_state)
        except ValueError as e:
            print("FAILED TO READ JSON")

    for s in strips:
        s.update()
