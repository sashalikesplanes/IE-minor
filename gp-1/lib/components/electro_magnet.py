# electro_magnet.py

import board
import digitalio

class ElectroMagnet():
    def __init__(self, port=board.D3):
        self.magnet = digitalio.DigitalInOut(port)
        self.magnet.direction = digitalio.Direction.OUTPUT

    # Takes either true or false
    def update(self, value):
        self.magnet.value = value
# Write your code here :-)
