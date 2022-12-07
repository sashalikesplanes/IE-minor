import busio
import board
import time
import json
from neopixel import NeoPixel, RGBW
from digitalio import DigitalInOut

# TODO setup the config
connections = [(1, 0), (1, 0)]
mushroom_configs = [
    {"but": board.A5, "led": board.A4, "cons": [], "color": (255, 0, 0)},
    {"but": board.A3, "led": board.A2, "cons": [], "color": (0, 255, 0)},
]

for i, c in enumerate(connections):
    mushroom_configs[c[0]]["cons"].append({"index": i, "dir": "pos"})
    mushroom_configs[c[1]]["cons"].append({"index": i, "dir": "neg"})


class Mushroom:
    def __init__(self, but, led, game, connections, color):
        self.pixels = NeoPixel(led, 1, brightness=1, auto_write=True, pixel_order=RGBW)
        self.button = DigitalInOut(but)
        self.prev_but_val = self.button.value
        self.game = game

        self.color = color
        self.is_on = False

        self.pixels[0] = (0, 0, 0)

        self.connections = connections  # store strip index and pos vs negative
        # connections = [{"index": 0, "dir": "pos"}]

    def set_color(self, color):
        self.pixels[0] = color

    def update_connections(self, color):
        for c in self.connections:
            self.game.electronics_state["strips"][c["index"]][c["dir"]] = color
        self.game.send_state()

    def update(self):
        if self.sense():
            if self.is_on:
                self.set_color((0, 0, 0))
                self.update_connections((0, 0, 0))
                self.is_on = False
            else:
                self.set_color(self.color)
                self.update_connections(self.color)
                self.is_on = True

    def sense_signals(self):
        recieved_colors = []
        for c in self.connections:
            recieving_dir = "pos"
            if c["dir"] == "pos":
                recieving_dir = "neg"
            recieved_color = self.game.electronics_state["strips"][c["index"]][
                recieving_dir
            ]

            if recieved_color != (0, 0, 0):
                recieved_colors.append(recieved_color)

        return recieved_colors

    def sense(self):
        current_button_value = self.button.value
        button_status = False

        # Only trigger on button release
        if self.prev_but_val == True and current_button_value == False:
            button_status = True

        self.prev_but_val = current_button_value

        return button_status


class ShroomTypes:
    ALIVE = 0
    DISEASED_NOT_PRESS = 1
    DISEASED_PRESSED = 2


class COLORS:
    LIFE = (0, 255, 0)
    DEATH = (255, 0, 0)
    MESSAGE = (255, 255, 255)


class Game:
    def __init__(self):
        self.uart = busio.UART(
            board.D0, board.D1, baudrate=9600, parity=busio.UART.Parity.EVEN
        )

        self.shrooms = [
            Mushroom(c["but"], c["led"], self, c["cons"], c["color"])
            for c in mushroom_configs
        ]

        self.electronics_state = {
            "strips": [
                {"pos": (0, 0, 0), "neg": (0, 0, 0)},
                {"pos": (0, 0, 0), "neg": (0, 0, 0)},
            ]
        }

    def init(self):
        for s in self.shrooms:
            s.set_color(COLORS.LIFE)
            s.update_connections(COLORS.LIFE)

    def update(self):
        for s in self.shrooms:
            s.update()

    def send_state(self):
        print(self.electronics_state)
        state_str = json.dumps(self.electronics_state) + "\n"
        state_bytes = bytearray([ord(c) for c in state_str])
        # self.uart.write(bytearray([len(state_bytes)]))
        self.uart.write(state_bytes)


start_time = time.monotonic()

game = Game()
game.init()
game.send_state()

while True:
    game.update()
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
