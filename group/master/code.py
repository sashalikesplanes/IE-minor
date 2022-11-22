import busio
import board
import time
import json
from neopixel import NeoPixel, RGBW
from digitalio import DigitalInOut

connections = [(0, 1), (0, 1)]
mushroom_configs = [
    {"but": board.A5, "led": board.A4},
    {"but": board.A3, "led": board.A4},
]


class Mushroom:
    def __init__(self, but, led):
        self.pixels = NeoPixel(led, 1, brightness=1, auto_write=True, pixel_order=RGBW)
        self.button = DigitalInOut(but)
        self.prev_but_val = self.button.value

    def set_color(self, color):
        self.pixels[0] = color

    def sense(self):
        if self.button.value == True and self.prev_but_val == False:
            self.prev_but_val = True
            return True
        self.prev_but_val = self.button.value
        return False


shroom = Mushroom(mushroom_configs[0]["but"], mushroom_configs[0]["led"])
shroom.set_color((0, 0, 255, 0))


class Game:
    def __init__(self):
        self.uart = busio.UART(
            board.D0, board.D1, baudrate=9600, parity=busio.UART.Parity.EVEN
        )

        self.electronics_state = {
            "strips": [
                {"pos": (255, 0, 0), "neg": (0, 255, 0)},
                {"pos": (0, 0, 0), "neg": (0, 0, 0)},
            ]
        }

    def send_state(self):
        print(self.electronics_state)
        state_str = json.dumps(self.electronics_state) + "\n"
        state_bytes = bytearray([ord(c) for c in state_str])
        # self.uart.write(bytearray([len(state_bytes)]))
        self.uart.write(state_bytes)


start_time = time.monotonic()

game = Game()
game.send_state()

while True:
    pass
    # if abs(time.monotonic() - start_time - 20) < 0.01:
    #     game.electronics_state["strips"][0]["pos"] = (0, 0, 0)
    #     game.send_state()
    # elif abs(time.monotonic() - start_time - 15) < 0.01:
    #     game.electronics_state["strips"][0]["neg"] = (0, 0, 0)
    #     game.send_state()
    # elif abs(time.monotonic() - start_time - 10) < 0.01:
    #     game.electronics_state["strips"][1]["pos"] = (0, 0, 0)
    #     game.send_state()
    # elif abs(time.monotonic() - start_time - 5) < 0.01:
    #     game.electronics_state["strips"][1]["neg"] = (0, 0, 0)
    #     game.send_state()
