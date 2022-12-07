import board
import math
import time
from pulser import Pulser, EncLED, ChainLED


class Disease:
    def __init__(self, delay, start_loc=0.5, spread_rate=0.01, max_size=0.25):
        self.start_time = delay + time.monotonic()
        self.loc = start_loc
        self.size = 0
        self.spread_rate = spread_rate
        self.max_size = max_size

    def update(self):
        time_since_start = time.monotonic() - self.start_time
        if time_since_start < 0:
            # Disease has not started
            return
        self.size = min(self.max_size, self.spread_rate * (time_since_start))


class MushroomTypes:
    NORMAL_NO_DISEASE = 0
    NORMAL_DISEASE = 1
    IMMUNE_NO_DISEASE = 2
    IMMUNE_DISEASE = 3


class Mushroom:
    def __init__(self, pulser):
        self.pulser = pulser
        self.type = MushroomTypes.NORMAL_NO_DISEASE
        self.button = 

    def update(self):
        self.pulser.update_color()

    def change_type(self, new_type):
        if self.type == new_type:
            return

        if new_type == MushroomTypes.NORMAL_NO_DISEASE:
            self.pulser.color_target = (1, 1, 1)
            self.pulser.min = 0.9
        elif new_type == MushroomTypes.NORMAL_DISEASE:
            self.pulser.color_target = (1, 1, 1)
            self.pulser.min = -0.1
        elif new_type == MushroomTypes.IMMUNE_DISEASE:
            self.pulser.color_target = (0, 1, 0)
            self.pulser.min = -0.1
        else:
            raise NotImplementedError("No Immune no disease")


class Link:
    def __init__(self, pulser):
        self.pulser = pulser

    def update(self):
        self.pulser.update_color()


class Game:
    def __init__(
        self,
        rotary_pins=[board.A0, board.A2, board.A4, board.D0],
        chain_pins=(board.D13, board.D10),
        disease_delay=1,
    ):
        self.mushrooms = [
            Mushroom(Pulser(EncLED(pin), time_multiple=3, min=0.8))
            for i, pin in enumerate(rotary_pins)
        ]

        self.links = [
            Link(
                Pulser(
                    ChainLED(chain_pins[0], chain_pins[1], i), time_multiple=1, min=0.8
                )
            )
            for i in range(4)
        ]
        self.pulsing = True

        self.disease = Disease(delay=disease_delay)

    def update_all(self):
        self.disease.update()
        # If there is a disease then change the behaviour of the local pulser

        if self.disease.size > 0:
            # make the nearest mushroom infected
            shroom_idx = math.floor((self.disease.loc + 0.01) * 4)
            self.mushrooms[shroom_idx].change_type(MushroomTypes.NORMAL_DISEASE)

        for m in self.mushrooms:
            m.update()

        for l in self.links:
            l.update()

        # Update dicease state

    def set_pulsing(self, flag):
        # flag can be 0 for no pulsing
        # 1 for yes pulsing
        # and -1 for flip
        if flag == 1:
            self._set_pulsing_on()
        elif flag == 0:
            self._set_pulsing_off()
        else:
            if self.pulsing:
                self._set_pulsing_off()
            else:
                self._set_pulsing_on()

    def _set_pulsing_on(self):
        self.pulsing = True
        for r in self.mushrooms:
            r.min = -0.1
        for c in self.links:
            c.min = -0.1

    def _set_pulsing_off(self):
        self.pulsing = False
        for r in self.mushrooms:
            r.min = 0.9
        for c in self.links:
            c.min = 0.9
