import time
import board
import analogio
import digitalio
import neopixel
import random
from analogio import AnalogIn
from components.button import Button
import usb_cdc
import time
import json

dataPort = usb_cdc.data

RED = (255, 0, 0)
YELLOW = (255, 150, 0)
PINK = (255, 51, 153)
GREEN = (0, 255, 0)
CYAN = (0, 255, 255)
BLUE = (0, 0, 255)
PURPLE = (180, 0, 255)
PINK = (255, 51, 153)
WHITE = (255, 255, 255)
OFF = (0, 0, 0)


class Pulse:
    def __init__(self, start_idx, end_idx, duration, width, color, hold_time):
        self.start_time = time.monotonic()
        self.position = start_idx
        self.start_idx = start_idx
        self.end_idx = end_idx
        self.duration = duration
        self.width = width
        self.color = color
        self.hold_time = hold_time
        self.start_hold_time = None

        self.is_done = False

    def update(self):
        # based on the difference between start time, current time and pace
        # Calculate the new values for the pos and neg peaks
        passed_time = time.monotonic() - self.start_time
        if passed_time > self.duration and self.hold_time < 0.01:
            self.is_done = True
            return
        elif passed_time > self.duration and self.hold_time > 0.01:
            if self.start_hold_time is None:
                self.start_hold_time = time.monotonic()

            if time.monotonic() - self.start_hold_time > self.hold_time:
                self.is_done = True
                return

        if self.start_hold_time is not None:
            return

        self.position = (
            self.start_idx
            + (self.end_idx - self.start_idx) * passed_time / self.duration
        )

    def get_active_idx(self):
        return list(
            range(
                int(self.position - self.width / 2), int(self.position + self.width / 2)
            )
        )


class Strip:
    def __init__(self, pin, num_pixels, exp_const=0.2, passive_color=OFF):
        self.pixels = neopixel.NeoPixel(
            pin, num_pixels, brightness=1, auto_write=False, pixel_order=neopixel.RGB
        )
        self.passive_color = passive_color
        self.pixels.fill(self.passive_color)
        self.pixels.show()

        self.node_pixels = []
        self.node_color = WHITE

        self.exp_const = exp_const

        self.num_pixels = num_pixels

        self.current_pulses = []

    def send(self, start, end, color, duration, width, hold_time):
        self.current_pulses.append(Pulse(start, end, duration, width, color, hold_time))

    def exp_color_mix(self, color1, color2, exp_const):
        return tuple(
            [
                int(c1 * exp_const + c2 * (1 - exp_const))
                for c1, c2 in zip(color1, color2)
            ]
        )

    def update(self):
        self.current_pulses = list(
            filter(lambda pulse: not pulse.is_done, self.current_pulses)
        )

        pixels_to_turn_on = set()
        pixels_to_turn_on.update([(i, self.node_color) for i in self.node_pixels])
        for p in self.current_pulses:
            p.update()
            if p.is_done:
                continue

            pixels_to_turn_on.update([(i, p.color) for i in p.get_active_idx()])

        self.pixels.fill(self.passive_color)

        for pix in pixels_to_turn_on:
            if pix[0] < 0 or pix[0] > self.num_pixels - 1:
                continue

            self.pixels[pix[0]] = self.exp_color_mix(
                pix[1],
                self.pixels[pix[0]],
                self.exp_const,
            )

        self.pixels.show()


class StripSegment:
    def __init__(self, start, end, strip_idx):
        self.start = start
        self.end = end
        self.strip_idx = strip_idx
        self.activated = None
        strips[self.strip_idx].node_pixels.append(start)

    def send(
        self, color, duration, width, hold_time, reverse=False, set_activated=False
    ):
        if (
            self.activated
            and (time.monotonic() - self.activated) < (duration + hold_time) - 0.5
        ):
            return
        if set_activated:
            self.activated = time.monotonic()
        if not reverse:
            strips[self.strip_idx].send(
                self.start, self.end, color, duration, width, hold_time
            )
        else:
            strips[self.strip_idx].send(
                self.end, self.start, color, duration, width, hold_time
            )


class Node:
    def __init__(self, strip_segments):
        # The node should know the strip segments that it is connected to
        self.segmenents = [
            StripSegment(s["start"], s["end"], s["index"]) for s in strip_segments
        ]
        self.queue = []

        self.last_activation = None

    def update(self):
        pulses_to_activate = filter(
            lambda pulse: time.monotonic() - pulse["start_time"] > 0, self.queue
        )
        self.queue = list(
            filter(
                lambda pulse: time.monotonic() - pulse["start_time"] <= 0, self.queue
            )
        )
        for p in pulses_to_activate:
            self._send_to_neighbor(
                p["segment"],
                p["color"],
                p["duration"],
                p["width"],
                p["hold_time"],
                p["proportional_duration"],
                reverse=p["reverse"],
                set_activated=p["set_activated"],
            )

    def send_to_neighbors(
        self, color, duration, width, hold_time=0, proportional_duration=False
    ):
        if (
            self.last_activation is not None
            and time.monotonic() - self.last_activation < NODE_ACTIVATION_TIMEOUT
        ):
            return

        self.last_activation = time.monotonic()

        for s in self.segmenents:
            total_duration = self._send_to_neighbor(
                s, color, duration, width, hold_time, proportional_duration
            )
            self.queue.append(
                {
                    "segment": s,
                    "start_time": time.monotonic() + total_duration,
                    "color": RED,
                    "width": 4,
                    "duration": 0.1,
                    "hold_time": 5,
                    "proportional_duration": True,
                    "reverse": True,
                    "set_activated": True,
                }
            )

    def send_to_random_neighbor(
        self,
        color,
        duration,
        width,
        hold_time=0,
        proportional_duration=False,
        set_activated=False,
    ):
        segment_idx = random.randint(0, len(self.segmenents) - 1)
        self._send_to_neighbor(
            self.segmenents[segment_idx],
            color,
            duration,
            width,
            hold_time,
            proportional_duration,
            set_activated=set_activated,
        )

    def _send_to_neighbor(
        self,
        segment,
        color,
        duration,
        width,
        hold_time,
        proportional_duration,
        reverse=False,
        set_activated=False,
    ):
        send_duration = duration
        if proportional_duration:
            send_duration = duration * (abs(segment.start - segment.end))
        segment.send(
            color,
            send_duration,
            width,
            hold_time,
            reverse=reverse,
            set_activated=set_activated,
        )

        return send_duration


def random_color(max_brightness=1):
    return tuple([int(max_brightness * random.randint(0, 255)) for _ in range(3)])


nodeMap = [
    [
        {"start": 11, "end": 47, "index": 2},
        {"start": 10, "end": 0, "index": 2},
        {"start": 99, "end": 63, "index": 3},
    ],
    [
        {"start": 61, "end": 100, "index": 3},
        {"start": 61, "end": 53, "index": 3},
    ],
    [
        {"start": 51, "end": 0, "index": 3},
        {"start": 51, "end": 61, "index": 3},
        {"start": 28, "end": 0, "index": 0},
        {"start": 28, "end": 39, "index": 0},
    ],
    [
        {"start": 34, "end": 0, "index": 2},
        {"start": 34, "end": 47, "index": 2},
    ],
    [
        {"start": 19, "end": 0, "index": 1},
        {"start": 19, "end": 23, "index": 1},
    ],
    [
        {"start": 23, "end": 65, "index": 1},
        {"start": 23, "end": 20, "index": 1},
        {"start": 47, "end": 36, "index": 2},
        {"start": 47, "end": 70, "index": 2},
    ],
    [
        {"start": 40, "end": 65, "index": 0},
        {"start": 40, "end": 30, "index": 0},
    ],
    [
        {"start": 65, "end": 100, "index": 1},
        {"start": 65, "end": 24, "index": 1},
    ],
]

PASSIVE_COLOR = (0, 0, 0)
strips = [
    Strip(board.D1, 100, passive_color=PASSIVE_COLOR),
    Strip(board.D3, 100, passive_color=PASSIVE_COLOR),
    Strip(board.D2, 100, passive_color=PASSIVE_COLOR),
    Strip(board.D7, 100, passive_color=PASSIVE_COLOR),
    Strip(board.A2, 50, passive_color=PASSIVE_COLOR),
]
nodes = [Node(strip_segments) for strip_segments in nodeMap]


NODE_ACTIVATION_TIMEOUT = 1.5
PASSIVE_ACTIVATION_TIMEOUT = 5
PASSIVE_ACTIVATION_COLOR = (0, 50, 0)
last_passive_activation = time.monotonic() - PASSIVE_ACTIVATION_TIMEOUT


def getActiveNodes(dataPort):
    data = None
    activeNodes = []
    if dataPort.in_waiting > 0:
        data = dataPort.readline()

    activeNodes = json.loads(data) if data else []
    return activeNodes


while True:
    strips[-1].pixels.fill(WHITE)
    strips[-1].pixels.show()
    activeNodes = getActiveNodes(dataPort)
    activeNodes = []

    for node_idx in activeNodes:
        nodes[node_idx].send_to_neighbors(
            WHITE, 0.1, 3, hold_time=0.0, proportional_duration=True
        )

    if (
        time.monotonic() - last_passive_activation
        > PASSIVE_ACTIVATION_TIMEOUT * random.random()
    ):
        last_passive_activation = time.monotonic()
        random_node_idx = random.randint(0, len(nodes) - 1)
        nodes[random_node_idx].send_to_random_neighbor(
            PASSIVE_ACTIVATION_COLOR, 5, 3, proportional_duration=False
        )

    for s in strips:
        s.update()

    for n in nodes:
        n.update()
