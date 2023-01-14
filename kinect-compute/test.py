import time


class Connection:
    def __init__(self, n1, n2, last_touch=time.monotonic()) -> None:
        self.n1 = n1
        self.n2 = n2
        self.last_touch = last_touch

    def __eq__(self, other) -> bool:
        return (self.n1 == other.n1 and self.n2 == other.n2) or (
            self.n1 == other.n2 and self.n2 == other.n1
        )


connections = []
connections.append(Connection(1, 3))
connections.append(Connection(1, 2))
print(connections.index(Connection(2, 1)))
