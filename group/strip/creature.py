import random
import board
import neopixel
import rotaryio
import pwmio
from components.button import Button

ONE_THIRD = 1.0/3.0
ONE_SIXTH = 1.0/6.0
TWO_THIRD = 2.0/3.0

def hls_to_rgb(h, l, s):
    if s == 0.0:
        return l, l, l
    if l <= 0.5:
        m2 = l * (1.0+s)
    else:
        m2 = l+s-(l*s)
    m1 = 2.0*l - m2
    return (_v(m1, m2, h+ONE_THIRD), _v(m1, m2, h), _v(m1, m2, h-ONE_THIRD))

def _v(m1, m2, hue):
    hue = hue % 1.0
    if hue < ONE_SIXTH:
        return m1 + (m2-m1)*hue*6.0
    if hue < 0.5:
        return m2
    if hue < TWO_THIRD:
        return m1 + (m2-m1)*(TWO_THIRD-hue)*6.0
    return m1


LIGHT = 0.5
SATURATION = 0.5
MAX_DUTY_CYCLE = 2**15

class Creature:

    def __init__(self):
        self.ecosystem = None

        self.pixels = neopixel.NeoPixel(board.A2, 1, brightness=1.0, auto_write=True)
        self.encoder = rotaryio.IncrementalEncoder(board.A4, board.A5)
        self.button = Button(port=board.D10)
        self.pwm = pwmio.PWMOut(board.D4, duty_cycle=MAX_DUTY_CYCLE, frequency=440, variable_frequency=True)

        self.last_position = None
        self.is_on = False

    def message(self, msg):
        if msg == 'sasha':
            print('hello sasha')

    # One iteration of the creatures main loop
    def loop(self):
        if self.is_on:
            self.last_position = self.encoder.position
            print(self.last_position)

            # Get the new hue and convert to RGB value
            new_hue = abs(self.last_position % 100)
            new_rgb_float = hls_to_rgb(new_hue / 100, LIGHT, SATURATION)
            new_rgb_int = tuple([int(c * 255) for c in new_rgb_float])

            self.pixels.fill(new_rgb_int)

            # Convert position to motor power
            motor_step = min(100, max(0, self.last_position))

            a = 40
            b = 100-a
            calc = ((15 /  100) *(a+(b/100)*motor_step))
            self.pwm.duty_cycle = int(2 ** calc)

        else:
            self.pixels.fill((0, 0, 0))
            self.pwm.duty_cycle = 0

        if self.button.sense_release():
            self.is_on = not self.is_on
