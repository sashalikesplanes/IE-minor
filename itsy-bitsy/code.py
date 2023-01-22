from behaviour_factories import create_message_behaviour, create_solid_behaviour
from configs import strip_configs
from time import monotonic, sleep
from neopixel import NeoPixel
import json
import usb_cdc

data_port = usb_cdc.data
data_port.reset_input_buffer()

BRIGHTNESS = 0.5

# Setup strips
strips = [NeoPixel(strip_config["pin"], strip_config["num_pixels"],
                   brightness=BRIGHTNESS, auto_write=False) for strip_config in strip_configs]
for s in strips:
    s.fill((0, 0, 0))
    s.show()


behaviours = []

while True:
    # Read incoming events and create behaviours
    events = []
    while data_port.in_waiting > 0:
        data = data_port.readline()
        print(data)
        try:
            events.append(json.loads(data))
        except:
            pass

    for event in events:
        if event['type'] == 'message':
            behaviours.append({'type': 'message', 'fn': create_message_behaviour(strips, behaviours,
                                                                                 monotonic(), event)})
        elif event['type'] == 'solid':
            behaviours.append({'type': 'solid', 'fn': create_solid_behaviour(strips, behaviours,
                                                                             monotonic(), event)})
        elif event['type'] == 'clear':
            behaviours = []
            for s in strips:
                s.fill((0, 0, 0))
                s.show()

    # Clear all the strips
    for s in strips:
        s.fill((0, 0, 0))

    # Apply solid behaviours
    for behaviour in behaviours:
        if behaviour['type'] == 'solid':
            if not behaviour['fn'](monotonic()):
                behaviours.remove(behaviour)

    # Apply message behaviours
    for behaviour in behaviours:
        if behaviour['type'] == 'message':
            if not behaviour['fn'](monotonic()):
                behaviours.remove(behaviour)

    # Push changes to strips
    for s in strips:
        s.show()
