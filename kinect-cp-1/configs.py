import board

WHITE = (255, 255, 255)
DIM_WHITE = (10, 10, 10)
OFF = (0, 0, 0)
GREEN = (255, 0, 0)
DIM_GREEN = (25, 0, 0)

RANDOM_COLORS = ()

NODE_PASSIVE_COLOR = DIM_WHITE

PASSIVE_COLOR = OFF
EXP_CONST = 0.35
SIGNAL_COLOR = GREEN
SIGNAL_PACE = 15
SIGNAL_WIDTH = 1.25
SIGNAL_DURATION = 3.5
SINGLE_SIGNAL_COLOR = DIM_GREEN
SINGLE_SIGNAL_PACE = 10
SINGLE_SIGNAL_WIDTH = 0.75
SINGLE_SIGNAL_DURATION = 1

node_map = [
    (None, 79, None, 17, 37),  # Done
    (None, None, 27, None, 48),  # Done
    (None, 88, 39, 66, None),  # Done -
    (70, 66, None, None, None),  # Done
    (None, 15, None, 76, None),  # Done -
    (47, 25, None, None, None),  # Done
    (17, None, None, None, 98),  # Done
    (38, None, None, 87, None),  # Done
    (27, None, None, None, None),  # Done and 28
    (None, None, 80, 99, None),  # Done
    (None, None, None, None, 78),  # Done
    (None, None, None, None, 25),  # Done
    (None, None, None, 40, None),  # Done
    (None, None, 53, None, None),  # Done, add 54
    (99, None, None, None, None),  # Done
    (59, None, None, None, None),  # Done
    (0, 0, None, None, 0),  # Done
    (None, None, None, 2, None),  # Done
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
