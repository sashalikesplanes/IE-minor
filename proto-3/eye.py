import json
import time
import board
from neopixel import NeoPixel
from adafruit_fancyled.adafruit_fancyled import CHSV, CRGB

class Var:
    def __init__(self, initial, step_size, step_time):
        self.current = initial
        self.next = initial
        self.step_size = step_size
        self.step_time = step_time
        self.last_update = time.monotonic()

    def trans(self, next, step_time=None, step_size=None):
        self.next = next
        self.last_update = time.monotonic()

        if step_time:
            self.step_time = step_time
        if step_size:
            self.step_size = step_size

    def update(self):
        if self.current == self.next:
            return False

        # If not enough time has passed, no change
        if time.monotonic() - self.last_update < self.step_time:
            return False

        # Update pos in the right direction
        if self.next > self.current:
            self.current += self.step_size
        else:
            self.current -= self.step_size

        self.last_update = time.monotonic()

        return True
        

class Eye:
    def __init__(self, brightness=0.1, initial_hue=0.5, hue_offset=0.1, initial_position=4):
        self.hue = Var(initial_hue, 0.01, 0.001)
        self.pos = Var(initial_position, 1, 0.1)

        self.hue_offset = hue_offset

        self.pixels = NeoPixel(board.D5, 256, brightness=brightness, auto_write=False)

        self._draw_eye() # draw the initial eye

    def loop(self):
        # If something has been changes, redraw and show new eye
        if self.hue.update() or self.pos.update():
            self._draw_eye()

    def _draw_eye(self):
        current_color = CHSV(self.hue.current)
        inner_color = CRGB(current_color)
        current_color.hue += self.hue_offset
        outer_color = CRGB(current_color)
        # Load an image stored in a text file, as a list of pixels
        with open('images/' +  f'eye{self.pos.current}' + '.json', 'r') as f:
            image_pixels = json.load(f)

        for i in range(256):
            self.pixels[i] = CRGB(*image_pixels[i]).pack()

            if CRGB(*self.pixels[i]).pack() == CRGB(0, 170, 255).pack():
                self.pixels[i] = outer_color.pack()
            elif CRGB(*self.pixels[i]).pack() == CRGB(0, 0, 255).pack():
                self.pixels[i] = inner_color.pack()
        self.pixels.show()

