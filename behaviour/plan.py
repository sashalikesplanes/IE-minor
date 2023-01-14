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

def update_ctx_activations(ctx: Context, activations: NodeActivations) -> Context:
    return Context(State(ctx.state.detections, activations, ctx.state.random), ctx.config, ctx.pixels)

def update_ctx_detections(ctx: Context, detections: NodeDetections) -> Context:
    return Context(State(detections, ctx.state.activations, ctx.state.random), ctx.config, ctx.pixels)

def update_ctx_pixels(ctx: Context, pixels: PixelsActivations) -> Context:
    return Context(ctx.state, ctx.config, pixels)

def detections_to_activations_transform(ctx: Context) -> Context:
    new_activations: NodeActivations = [detection for detection in ctx.state.detections]
    return update_ctx_activations(ctx, new_activations)

def apply_detections(ctx: Context, new_detections: NodeDetections) -> Context:
    ctx = update_ctx_detections(ctx, new_detections)
    ctx = detections_to_activations_transform(ctx)
    ctx = activation_to_pixels_transform(ctx)
    ctx = nodes_to_pixels_transform(ctx)
    ctx = random_to_pixels_transform(ctx)
    return ctx




