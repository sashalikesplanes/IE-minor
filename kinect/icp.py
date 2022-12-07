import adafruit_board_toolkit.circuitpython_serial
import serial

dataport = adafruit_board_toolkit.circuitpython_serial.data_comports()[0]
s = serial.Serial(dataport.device)
print(s)
s.write(b"x")
