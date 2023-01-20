import neopixel
from configs import (
    DIM_WHITE,
    NODE_PASSIVE_COLOR,
    SIGNAL_COLOR,
    SIGNAL_DURATION,
    SIGNAL_PACE,
    SIGNAL_WIDTH,
    SINGLE_SIGNAL_COLOR,
    SINGLE_SIGNAL_DURATION,
    SINGLE_SIGNAL_PACE,
    SINGLE_SIGNAL_WIDTH,
    node_map,
    strip_configs_old,
)
from blocks import Pixel, Node, StripSegment
from path_finding import get_segments, edges
import board
import time
import random
from components.button import Button
from kinect import Camera

but = Button(port=board.A0)


class Pulse:
    def __init__(
        self,
        segment: StripSegment,
        pace,
        duration,
        width,
        color,
        start_time=time.monotonic(),
    ):
        self.on_pixels: list[Pixel] = []
        self.start_time = start_time
        self.segment = segment
        self.duration = duration
        self.is_done = False
        self.width = width
        self.pace = pace
        self.color = color
        self.pos = self.segment.start_idx

    def update(self):
        # Expire the pulse
        time_since_start = time.monotonic() - self.start_time
        if time_since_start > self.duration:
            self.is_done = True

        # Calculate new pulse center
        if self.segment.is_positive:
            self.pos = self.segment.start_idx + self.pace * time_since_start
            while self.pos > self.segment.end_idx:
                self.pos -= self.segment.length
        else:
            self.pos = self.segment.start_idx - self.pace * time_since_start
            while self.pos < self.segment.end_idx:
                self.pos += self.segment.length

        self.on_pixels = []  # Remove the previously lit pixels

        # Convert center position into pixels to be turned on
        for i in range(int(self.pos - self.width / 2), int(self.pos + self.width / 2)):
            # Check if the pixel is inside the strip segment
            if self.segment.is_positive and (
                i < self.segment.start_idx or i > self.segment.end_idx
            ):
                continue
            elif not self.segment.is_positive and (
                i < self.segment.end_idx or i > self.segment.start_idx
            ):
                continue

            self.on_pixels.append(Pixel(i, self.color))


class Strip:
    def __init__(self, strip_config):
        self.pixels = neopixel.NeoPixel(
            strip_config["pin"],
            strip_config["num_pixels"],
            brightness=1,
            auto_write=False,
        )
        self.passive_color = strip_config["passive_color"]
        self.exp_const = strip_config["exp_const"]
        self.pixels_to_turn_on = []

    def show(self):
        # Here we will paint all the pixels and reset it
        # self.pixels_to_turn_on = [Pixel(i, (i, 0, 0)) for i in range(5, 30)]

        for i, _ in enumerate(self.pixels):
            self.pixels[i] = self._exp_color_mix(
                self.passive_color, self.pixels[i], self.exp_const
            )
        for p in self.pixels_to_turn_on:
            if p.idx < 0 or p.idx > len(self.pixels) - 1:
                continue
            self.pixels[p.idx] = self._exp_color_mix(
                p.color, self.pixels[p.idx], self.exp_const
            )

        self.pixels.show()

        self.pixels_to_turn_on = []

    def _exp_color_mix(self, color1, color2, exp_const):
        return tuple(
            [
                int(c1 * exp_const + c2 * (1 - exp_const))
                for c1, c2 in zip(color1, color2)
            ]
        )


class StripManager:
    def __init__(self, strip_configs):
        self.strips = [Strip(strip_config) for strip_config in strip_configs]
        self.pulses: list[Pulse] = []
        self.nodes: list[Node] = []

        for i, node in enumerate(node_map):
            for strip_idx, start_idx in enumerate(node):
                if start_idx is None:
                    continue

                if i == 13 or i == 8:
                    self.nodes.append(
                        Node(strip_idx, start_idx,
                             NODE_PASSIVE_COLOR, wall_node=True)
                    )
                else:
                    self.nodes.append(
                        Node(strip_idx, start_idx, NODE_PASSIVE_COLOR))

    def update(self):
        for p in self.pulses:
            p.update()

            if p.is_done:
                continue

            self.append_pulse_pixels(p)

        for n in self.nodes:
            n.update()
            self.append_node_pixels(n)

        self.pulses = list(filter(lambda p: not p.is_done, self.pulses))

        for s in self.strips:
            s.show()

    def start_signal(self, start, end, color, pace, width, duration):
        segments = get_segments(start, end)
        for i, s in enumerate(segments):
            start_time = time.monotonic()
            # If it isnt the first segment then delay the pulse
            if i > 0:
                for s2 in segments[0:i]:
                    start_time += s2.length / pace

            self.pulses.append(
                Pulse(s, pace, duration, width, color, start_time=start_time)
            )

    def append_pulse_pixels(self, pulse: Pulse):
        # Convert the state of the pixel into pixels to turn on
        # Here we wanna
        for p in pulse.on_pixels:
            self.strips[pulse.segment.strip_idx].pixels_to_turn_on.append(p)

    def append_node_pixels(self, node: Node):
        for p in node.on_pixels:
            self.strips[node.strip_idx].pixels_to_turn_on.append(p)


strip_manager = StripManager(strip_configs_old)
camera = Camera()

while True:
    camera.update()
    # Here we do the single behaviour
    if camera.connections_to_trigger is not None and isinstance(
        camera.connections_to_trigger, int
    ):
        # Trigger single behaviour
        neighbor_nodes = list(
            map(
                lambda node: node.end_node,
                filter(
                    lambda seg: seg.start_node == camera.connections_to_trigger, edges
                ),
            )
        )
        for n in neighbor_nodes:
            strip_manager.start_signal(
                camera.connections_to_trigger,
                n,
                SINGLE_SIGNAL_COLOR,
                SINGLE_SIGNAL_PACE,
                SINGLE_SIGNAL_WIDTH,
                SINGLE_SIGNAL_DURATION,
            )
    elif camera.connections_to_trigger is not None:
        for con in camera.connections_to_trigger:
            strip_manager.start_signal(
                con["n1"],
                con["n2"],
                SIGNAL_COLOR,
                SIGNAL_PACE,
                SIGNAL_WIDTH,
                SIGNAL_DURATION,
            )
    else:
        if random.random() < 0.1:
            strip_manager.start_signal(
                random.randint(0, len(node_map) - 1),
                random.randint(0, len(node_map) - 1),
                DIM_WHITE,
                SINGLE_SIGNAL_PACE,
                SINGLE_SIGNAL_WIDTH,
                SINGLE_SIGNAL_DURATION,
            )

    camera.connections_to_trigger = None

    # If we have one node we do one behaviour

    strip_manager.update()

    if but.sense_release():
        start = random.randint(0, 19)
        start = 8
        end = random.randint(0, 19)
        end = 14
        strip_manager.start_signal(
            start, end, SIGNAL_COLOR, SIGNAL_PACE, SIGNAL_WIDTH, SIGNAL_DURATION
        )
