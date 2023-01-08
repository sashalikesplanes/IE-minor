from typing import List, NamedTuple

NodeDetections = List[float] # Index of the node, time since it was last detected as active
NodeActivations = List[float] # Index of the node, time since last activation
Random = int # A placeholder for random behaviour

class State(NamedTuple):
    detections: NodeDetections
    activations: NodeActivations
    random: Random

class Config(NamedTuple):
    strip_lengths: List[int]

class Color(NamedTuple):
    red: int
    green: int
    blue: int
    times_applied: int # The number of times this pixel has been painted

PixelsActivations = List[List[Color]] # Per strip, the list of colors per pixel

class Context(NamedTuple):
    state: State
    config: Config
    pixels: PixelsActivations


def set_blank_pixels(ctx: Context) -> Context:
    pixels: PixelsActivations = [[Color(0,0,0,0) for _ in range(strip_length)] for strip_length in ctx.config.strip_lengths]
    return Context(ctx.state, ctx.config, pixels)

def get_initial_context() -> Context:
    # Get the config
    initial_detections: NodeDetections = []
    initial_activations: NodeActivations = []
    initial_random: Random = 0

    strip_lengths = [100 ,100]

    ctx = Context(State(initial_detections, initial_detections, initial_random), Config(strip_lengths), [[]])

    ctx = set_blank_pixels(ctx)

    return ctx

def get_new_detections(ctx: Context) -> Context:
    new_detections: NodeDetections = []
    return Context(State(new_detections, ctx.state.activations, ctx.state.random), ctx.config, ctx.pixels)

def apply_ctx(ctx: Context) -> Context:
    # From ctx.state, and from config, 
    return ctx


ctx = get_initial_context()
def loop():
    global ctx
    ctx = get_new_detections(ctx)
    ctx = apply_ctx(ctx)



