import json
import usb_cdc


class Camera:
    def __init__(self):
        self.data_port = usb_cdc.data
        self.active_nodes = []

    def update(self):
        if self.data_port.in_waiting > 0:
            data = self.data_port.readline()
            self.active_nodes = json.loads(data) if data else []
            print(self.active_nodes)
