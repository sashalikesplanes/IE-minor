# Write your code here :-)
import pwmio
import board
import time
from adafruit_motor import motor
#from board import SCL,SDA

max = 2**15

#Assigning the maximum electricity output
pwm = pwmio.PWMOut(board.D2, duty_cycle=max, frequency=440, variable_frequency=True)
#pwm_reverse = pwmio.PWMOut(board.D7, duty_cycle=0, frequency=440, variable_frequency=True)

#motor4 = motor.DCMotor(SCL, SDA)

#motor4.duty_cycle = 2**15

while True:
    time.sleep(1)
    pwm.duty_cycle = 0
    #motor4.throttle = 0.5
    #pwm_reverse.duty_cycle = max
    print("p")
    time.sleep(1)
    #pwm_reverse.duty_cycle = 0
    pwm.duty_cycle = 2**15

