import board

WHITE = (255, 255, 255)
DIM_WHITE = (25, 25, 25)
OFF = (0, 0, 0)
GREEN = (255, 0, 0)

NODE_PASSIVE_COLOR = DIM_WHITE

PASSIVE_COLOR = OFF
EXP_CONST = 0.35
SIGNAL_COLOR = GREEN
SIGNAL_PACE = 10
SIGNAL_WIDTH = 1.5
SIGNAL_DURATION = 5

node_map = [
    (None, 79, None, 17, 37),  # Done
    (None, None, 27, None, 48),  # Done
    (None, 88, 39, 66, None),  # Done -
    (70, 66, None, None, None),  # Done
    (None, 15, None, 76, None),  # Done -
    (47, 25, None, None, None),  # Done
    (9, None, None, None, 98),  # Done
    (36, None, None, 86, None),  # Done
    (25, None, None, None, None),  # Done
    (None, None, 80, 99, None),  # Done
    (None, None, None, None, 78),  # Done
    (None, None, None, None, 25),  # Done
    (None, None, None, 40, None),  # Done
    (None, None, 53, None, None),  # Done
    (99, None, None, None, None),  # Done
    (59, None, None, None, None),  # Done
    (0, 0, 0, None, 0),  # Done
    (None, None, None, 0, None),  # Done
    (None, 44, None, None, None),  # Done
    (None, None, 11, None, None),  # Done
]


strip_configs = [
    {
        "pin": board.A2,
        "num_pixels": 100,
        "passive_color": PASSIVE_COLOR,
        "exp_const": EXP_CONST,
    },
    {
        "pin": board.A4,
        "num_pixels": 100,
        "passive_color": PASSIVE_COLOR,
        "exp_const": EXP_CONST,
    },
    {
        "pin": board.D3,
        "num_pixels": 100,
        "passive_color": PASSIVE_COLOR,
        "exp_const": EXP_CONST,
    },
    {
        "pin": board.D4,
        "num_pixels": 100,
        "passive_color": PASSIVE_COLOR,
        "exp_const": EXP_CONST,
    },
    {
        "pin": board.D13,
        "num_pixels": 100,
        "passive_color": PASSIVE_COLOR,
        "exp_const": EXP_CONST,
    },
]
