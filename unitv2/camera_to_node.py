import time 
import requests
import cv2, queue, threading
CHARS_PER_MESSAGE = 60_000 # max limit for shiftr.io is 64kb
TOPIC = "unitv2-cam0"
# URL = 'http://10.254.239.221:3000/cam0'
URL = 'http://localhost:3000/cam0'

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
    retval, buffer = cv2.imencode('.png', self.q.get())
    return buffer
    
if __name__ == "__main__":
    capture = VideoCapture(0)
    frame_count = 0
    while True:
        with requests.Session() as s:
            files= {'image': ('cam0_frame' + str(frame_count) + '.png', capture.read(), 'multipart/form-data', {'Expires': '0'}) }
            r = s.post(URL,files=files)
            frame_count += 1
            time.sleep(INTERVAL)
