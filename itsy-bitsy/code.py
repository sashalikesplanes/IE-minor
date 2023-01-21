from behaviour_factories import create_message_behaviour, create_solid_behaviour
from configs import strip_configs
from time import monotonic, sleep
from neopixel import NeoPixel
import json
import usb_cdc

data_port = usb_cdc.data
data_port.reset_input_buffer()

# Setup strips
strips = [NeoPixel(strip_config["pin"], strip_config["num_pixels"],
                   brightness=1, auto_write=False) for strip_config in strip_configs]
for s in strips:
    s.fill((0, 0, 0))
    s.show()


behaviours = []

while True:
    # Read incoming events and create behaviours
    event = None
    if data_port.in_waiting > 0:
        data = data_port.readline()
        print(data)
        try:
            event = json.loads(data)
        except:
            event = None

    if event is not None:
        if event['type'] == 'message':
            behaviours.append(create_message_behaviour(strips, behaviours,
                                                       monotonic(), event))
        elif event['type'] == 'solid':
            behaviours.append(create_solid_behaviour(strips, behaviours,
                                                     monotonic(), event))
        elif event['type'] == 'clear':
            behaviours = []
            for s in strips:
                s.fill((0, 0, 0))
                s.show()

    # Clear all the strips
    for s in strips:
        s.fill((0, 0, 0))

    # Apply behaviours to strips
    for behaviour in behaviours:
        if not behaviour(monotonic()):
            behaviours.remove(behaviour)

    # Push changes to strips
    for s in strips:
        s.show()
