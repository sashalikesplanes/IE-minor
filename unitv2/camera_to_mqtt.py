from sys import getsizeof
import base64
import paho.mqtt.client as mqtt
import time 
import json
from math import ceil
import cv2, queue, threading
CHARS_PER_MESSAGE = 60_000 # max limit for shiftr.io is 64kb
TOPIC = "unitv2-cam0"

QOS = 2
INTERVAL = 2

class VideoCapture:

  def __init__(self, name):
    self.cap = cv2.VideoCapture(name)
    self.q = queue.Queue()
    t = threading.Thread(target=self._reader)
    t.daemon = True
    t.start()

  # read frames as soon as they are available, keeping only most recent one
  def _reader(self):
    while True:
      ret, frame = self.cap.read()
      if not ret:
        break
      if not self.q.empty():
        try:
          self.q.get_nowait()   # discard previous (unprocessed) frame
        except queue.Empty:
          pass
      self.q.put(frame)

  def read(self):
    return self.q.get()

def make_img_payload(capture):
    global frame_count
    frame = capture.read()
    retval, buffer = cv2.imencode('.jpg', frame)
    img_str = base64.b64encode(buffer)
    img_chunks = [img_str[i * CHARS_PER_MESSAGE: (i + 1) * CHARS_PER_MESSAGE] for i in range(0, ceil(len(img_str) / CHARS_PER_MESSAGE))]
    begin_time = time.monotonic()
    json_chunks = [json.dumps({'time': begin_time, 'frame_i': frame_count, 'chunk_nr': i, 'total_chunks': len(img_chunks), 'chunk': str(chunk)}) for i, chunk in enumerate(img_chunks)] 
    frame_count += 1
    return json_chunks
    
def publish_multiple(client, chunks):
  for c in chunks:
      client.publish(TOPIC, c, qos=QOS)
      
def on_connect(client, userdata, flags, rc):
    # client.subscribe(TOPIC)
    print('connected')
    
def on_message(client, userdata, msg):
    msg = json.loads(msg.payload.decode('utf-8'))

    if msg['total_chunks'] - 1 == msg['chunk_nr']:
        print('received last message for frame ', msg['frame_i'], ' after ', time.monotonic() - msg['time'], ' s')


    
if __name__ == "__main__":
    capture = VideoCapture(0)
    client = mqtt.Client('sasha-test')
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect("127.0.0.1")
    client.loop_start()
    
    frame_count = 0
    while True:
        chunks = make_img_payload(capture)
        publish_multiple(client, chunks)
        print('publishing')
        time.sleep(INTERVAL)