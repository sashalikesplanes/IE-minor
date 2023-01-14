import json
import usb_cdc


class Camera:
    def __init__(self):
        self.data_port = usb_cdc.data
        self.connections_to_trigger = None

    def update(self):
        if self.data_port.in_waiting > 0:
            data = self.data_port.readline()
            self.connections_to_trigger = json.loads(data) if data else []
            print(self.connections_to_trigger)
