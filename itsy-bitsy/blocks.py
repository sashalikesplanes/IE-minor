class StripSegment:
    def __init__(self, strip_idx, start_idx, end_idx, start_node, end_node):
        self.strip_idx = strip_idx
        self.start_idx = start_idx
        self.end_idx = end_idx
        self.start_node = start_node
        self.end_node = end_node
        self.length = abs(self.start_idx - self.end_idx) + 1
        self.is_positive = True

        if self.end_idx - self.start_idx < 0:
            self.is_positive = False

    def __repr__(self) -> str:
        return f"{self.strip_idx}:{self.start_idx}:{self.end_idx}:{self.start_node}:{self.end_node}"


class Node:
    def __init__(self, strip_idx, start_idx, color, wall_node=False):
        self.strip_idx = strip_idx
        self.on_pixels = []
        self.start_idx = start_idx
        self.color = color

        self.is_wall_node = wall_node

    def update(self):
        self.on_pixels = [Pixel(self.start_idx + i, self.color) for i in range(-2, 3)]


class Pixel:
    def __init__(self, idx, color):
        self.idx = idx
        self.color = color
