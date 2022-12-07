# Write your code here :-)

#import all the necessary libraries
import time
from timer import Timer
import board
from digitalio import DigitalInOut, Direction
from rainbowio import colorwheel
import neopixel


#=============================LED Setup================================
pixel2_pin = board.A0
num_pixels2 = 1

pixels2 = neopixel.NeoPixel(pixel2_pin, num_pixels2, brightness=0.3, auto_write=False)
#==========================End of LED setup============================

while True:
    pixels2.fill((0, 100, 0))
    pixels2.show()

