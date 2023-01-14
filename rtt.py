from sys import getsizeof
import base64
import paho.mqtt.client as mqtt
from time import time, sleep
import uuid
import json
from math import ceil

chars_per_message = 60_000 # max limit for shiftr.io is 64kb

INTERVAL = 2
QOS = 0

def make_msg_payload():
    sleep(INTERVAL)
    begin_send_time = time()
    with open('test.jpg', 'rb') as f:
        img_str = base64.b64encode(f.read())
    print(getsizeof(img_str), len(img_str))
    img_chunks = [img_str[i * chars_per_message: (i + 1) * chars_per_message] for i in range(0, ceil(len(img_str) / chars_per_message))]
    json_chunks = [json.dumps({'time': begin_send_time, 'chunk_nr': i, 'total_chunks': len(img_chunks), 'chunk': str(chunk)}) for i, chunk in enumerate(img_chunks)] 
    # msg_payload = {'time': begin_send_time, 'img': str(img_str)}
    # return json.dumps(msg_payload)
    return json_chunks

def publish_multiple(client, chunks):
    for c in chunks:
        client.publish(topic, c, qos=QOS)
    


def on_connect(client, userdata, flags, rc):
    client.subscribe(topic)
    publish_multiple(client, make_msg_payload())


def on_message(client, userdata, message):
    msg = message.payload.decode('utf-8')
    msg_dict = json.loads(msg)
    if msg_dict['chunk_nr'] != msg_dict['total_chunks'] - 1:
        return

    rtt = - float(msg_dict['time']) + time()
    rtt_array.append(rtt)
    rtt_max = max(rtt_array)
    rtt_average = sum(rtt_array) / len(rtt_array)
    rtt_min = min(rtt_array)
    print('Current: %s' % rtt)
    print('Maximum: %s' % rtt_max)
    print('Average: %s' % rtt_average)
    print('Minimum: %s' % rtt_min)
    publish_multiple(client, make_msg_payload())


def on_log(client, userdata, level, buf):
    print(level, buf)


rtt_array = []
topic = str(uuid.uuid4())
client = mqtt.Client('sasha-test')
client.on_connect = on_connect
client.on_message = on_message
client.on_log = on_log
client.connect("172.23.4.99")
client.loop_forever()
