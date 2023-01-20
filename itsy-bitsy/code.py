from behaviour_factories import create_message_behaviour
from configs import strip_configs
from time import monotonic, sleep
from neopixel import NeoPixel
from test_events import first_event
import json

import usb_cdc

data_port = usb_cdc.data


strips = [NeoPixel(strip_config["pin"], strip_config["num_pixels"],
                   brightness=1, auto_write=False) for strip_config in strip_configs]

for s in strips:
    s.fill((0, 0, 0))
    s.show()


behaviours = []
behaviours.append(create_message_behaviour(strips, behaviours,
                                           monotonic(), first_event))
data_port.reset_input_buffer()

while True:
    if data_port.in_waiting > 0:
        data = data_port.readline()
        event = json.loads(data)
        print(data, event)

        if event['event_type'] == 'message':
            behaviours.append(create_message_behaviour(strips, behaviours,
                                                       monotonic(), event))

    for behaviour in behaviours:
        if not behaviour(monotonic()):
            behaviours.remove(behaviour)

    for s in strips:
        s.show()
