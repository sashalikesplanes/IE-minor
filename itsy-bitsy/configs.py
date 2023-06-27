import board

NODE_COLOR = (255, 255, 255)
INTENSITY_UPDATE_THRESHOLD = 0.1

strip_configs = [
    {
        "pin": board.D7,
        "num_pixels": 100,
    },
    {
        "pin": board.D13,
        "num_pixels": 100,
    }
]
