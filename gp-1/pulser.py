from neopixel import NeoPixel, RGB
import time
import math
import board
import random
from p9813 import P9813


class EncLED:
    def __init__(self, pixel_pin):
        self.pixels = NeoPixel(
            pixel_pin, 1, brightness=1, auto_write=True, pixel_order=RGB
        )

    def fill(self, color):
        self.pixels[0] = color


class ChainLED:
    led_chains = None

    def __init__(self, pin_clk, pin_data, index):
        if ChainLED.led_chains == None:
            ChainLED.led_chains = P9813(pin_clk, pin_data, 4)

        self.leds = ChainLED.led_chains

        self.index = index

    def fill(self, color):
        self.leds[self.index] = color
        self.leds.write()


class Pulser:
    def __init__(
        self,
        led,
        time_multiple=2,
        phase_shift=0,
        min=0,
        max=1.1,
        color_target=(1, 1, 1),
    ):
        self.led = led
        self.color_target = color_target
        self.time_multiple = time_multiple
        self.phase_shift = phase_shift
        self.min = min
        self.max = max

        self.color = (255, 255, 255)

    def current_intensity(self):
        # 1.0 phase shift returns to the same point state in the wave
        A = (self.max - self.min) / 2
        D = self.min + A
        C = math.pi * 2 * self.phase_shift
        intensity = A * math.cos(self.time_multiple * time.monotonic() + C) + D

        return intensity

    def update_color(self, current_weight_exp=0.1):
        current_intensity = self.current_intensity()
        color = tuple([255 * current_intensity * c for c in self.color_target])

        # now take exponential average to set a new color
        self.color = tuple(
            [
                min(
                    255,
                    max(
                        0,
                        int(c * current_weight_exp + c_old * (1 - current_weight_exp)),
                    ),
                )
                for (c, c_old) in zip(color, self.color)
            ]
        )

        self.led.fill(self.color)
