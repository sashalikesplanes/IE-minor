# Write your code here :-)
# Write your code here :-)
import pwmio
import board
import time
import rotaryio
import math
import digitalio
import neopixel
from rainbowio import colorwheel




"""
Here we assign the initial positions of the rotary encoder.
it need 4 pins to properly function, 2 for the rotation
1 for the button and 1 for the light.
"""

#assigning the pins that the encoder is connected to
encoder = rotaryio.IncrementalEncoder(board.D4, board.D7)
last_position = None

#assigning the pin for the button
#button = digitalio.DigitalInOut(board.D13)
last_state = False

#assigning the light of the encoder to a pin
pixel_pin = board.D3

#there is only 1 light
num_pixels = 1
pixels = neopixel.NeoPixel(pixel_pin, num_pixels, brightness=1, auto_write=False, pixel_order=neopixel.RGB)







"""
Here we assign the PWM signals that the mosfet is going to recieve.
"""


#the maximum duty_cycle is 2^15 (because bits and bytes)
#We made a seperate variable of the maximum output to be able to prevent using numbers all the time
max = 2**15

#Assigning the maximum electricity output
pwm = pwmio.PWMOut(board.D2, duty_cycle=max, frequency=440, variable_frequency=True)




while True:


    # Poll the encoder position on each run through the loop.
    position = encoder.position

    #here we set boundries to prevent the PWM signal to be higher than it can handle
    if position > 100:
        position = 100
        encoder.position = 100

    elif position < 0:
        position = 0
        encoder.position = 0



    if last_position is None or position != last_position:
        degrees = position * 15
        revolutions = math.trunc(position/24) # math.trunc() rounds towards 0



        #here we assign the speed to the position of the encoder

        """
        There is a threshold to when the motor starts moving, but this depends on the friction
        because de maximum PWM signal is 2^15 we are going to use that number to map it onto the position variable
        because we limited the position variable to a value bettween 0 and 100, we needs it to be 2
        """
        a = 40
        b = 100-a
        calc = ((15 /  100) *(a+(b/100)*position))
        pwm.duty_cycle = int(2 ** calc)



        #here is a print code to show some variables, per variable the format displays it
        print("Position: {0}".format(position))
    last_position = position
"""
    # Poll the button state on each run through the loop.
    # If a button press is detected the position is reset to 0.
    if button.value is True and last_state is False:
        print("Reset Encoder Position...")
        encoder.position = 0
    last_state = button.value
"""
    # The colorwheel function cycles through all colors every 255 increments.
    # The math.fabs() function returns absolute value (negative is unsupported)
    # 255/24 = 10,625 full encoder revolutions are equivalent to one color cycle.
    #rgb_color = colorwheel(math.fabs(position))
    #pixels.fill(rgb_color)
    #pixels.show()












    #time.sleep(1)
    #pwm.duty_cycle = 0
    #motor4.throttle = 0.5
    #pwm_reverse.duty_cycle = max
    #print("p")
    #time.sleep(1)
    #pwm_reverse.duty_cycle = 0
    #pwm.duty_cycle = 2**15

