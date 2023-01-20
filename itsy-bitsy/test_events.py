first_event = {
    'type': 'message',
    'strip_idx': 0,
    'start_idx': 40,
    'end_idx': 46,
    "color": (255, 0, 0),
    "message_width": 10,  # pixels
    "pace": 10,  # pixels per second
    'next': None,
}

second_event = {
    'type': 'message',
    'strip_idx': 1,
    'start_idx': 25,
    'end_idx': 17,
    "color": (255, 0, 0),
    "message_width": 10,  # pixels
    "pace": 10,  # pixels per second
    'next': None,
}

third_event = {
    'type': 'message',
    'strip_idx': 3,
    'start_idx': 75,
    'end_idx': 85,
    "color": (255, 0, 0),
    "message_width": 10,  # pixels
    "pace": 10,  # pixels per second
    'next': first_event,
}

second_event["next"] = third_event
first_event["next"] = second_event
