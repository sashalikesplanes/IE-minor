import json
import time
import board
from digitalio import DigitalInOut
from adafruit_vl53l0x import VL53L0X
from adafruit_tca9548a import TCA9548A
from neopixel import NeoPixel
from adafruit_fancyled.adafruit_fancyled import CHSV, CRGB
import random
from eye import Eye

# i2c = board.I2C()
# multiplexer = TCA9548A(i2c)

# tof_sensors = [
#     VL53L0X(multiplexer[0]),
#     VL53L0X(multiplexer[3]),
    # VL53L0X(multiplexer[7]),
# ]

eye = Eye()

while True:
    eye.loop()
    if random.random() > 0.1:
        eye.pos.trans(random.randint(0, 9))

    if random.random() > 0.1:
        eye.hue.trans(random.random(), step_size=0.03)


        


# while True:
#     print('ranges: ', [sensor.range for sensor in tof_sensors])
#     time.sleep(0.1)

