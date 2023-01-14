import numpy as np
import time
import pandas as pd
import cv2
import json
import sys
from pylibfreenect2 import Freenect2, SyncMultiFrameListener
from pylibfreenect2 import FrameType, Registration, Frame
import torch
from playsound import playsound

import adafruit_board_toolkit.circuitpython_serial
import serial

dataport = adafruit_board_toolkit.circuitpython_serial.data_comports()[0]
cpPort = serial.Serial(dataport.device)


def onYoloData(callback):
    try:
        from pylibfreenect2 import OpenGLPacketPipeline

        pipeline = OpenGLPacketPipeline()
    except:
        try:
            from pylibfreenect2 import OpenCLPacketPipeline

            pipeline = OpenCLPacketPipeline()
        except:
            from pylibfreenect2 import CpuPacketPipeline

            pipeline = CpuPacketPipeline()
    print("Packet pipeline:", type(pipeline).__name__)

    fn = Freenect2()
    serial = fn.getDefaultDeviceSerialNumber()
    device = fn.openDevice(serial, pipeline=pipeline)
    listener = SyncMultiFrameListener(FrameType.Color | FrameType.Ir | FrameType.Depth)
    device.setIrAndDepthFrameListener(listener)
    device.setColorFrameListener(listener)
    device.start()
    # device.stop()
    # device.close()
    # return

    registration = Registration(
        device.getIrCameraParams(), device.getColorCameraParams()
    )

    undistorted = Frame(512, 424, 4)
    registered = Frame(512, 424, 4)

    need_bigdepth = False
    need_color_depth_map = False

    bigdepth = Frame(1920, 1082, 4) if need_bigdepth else None
    color_depth_map = (
        np.zeros((424, 512), np.int32).ravel() if need_color_depth_map else None
    )

    model = torch.hub.load(
        "ultralytics/yolov5", "yolov5n6", pretrained=True, _verbose=False
    )
    # model.cuda()
    last_ambient = time.monotonic()

    while True:
        if time.monotonic() - last_ambient > 62:
            last_ambient = time.monotonic()

        frames = listener.waitForNewFrame()
        print("got rrame")
        color = frames["color"]
        ir = frames["ir"]
        depth = frames["depth"]

        registration.apply(
            color,
            depth,
            undistorted,
            registered,
            bigdepth=bigdepth,
            color_depth_map=color_depth_map,
        )

        results = model([color.asarray()])
        results.render()

        for im in results.ims:
            for n in nodes:
                im[n["y"] - 5 : n["y"] + 5, n["x"] - 5 : n["x"] + 5] = [250, 0, 0]
            if showImage:
                cv2.imshow("infered", im)

            if saveImage:
                cv2.imwrite("picture.jpg", im)
                print("picture saved")

        if showIrImage:
            cv2.imshow("ir", ir.asarray() / 65535.0)
            # cv2.imshow("depth", depth.asarray() / 4500.0)
            # cv2.imshow("color", cv2.resize(color.asarray(), (int(1920 / 3), int(1080 / 3))))
            # cv2.imshow("registered", registered.asarray(np.uint8))

        # print(results.pandas().xyxy[0])
        callback(results.pandas().xyxy[0])
        # break

        listener.release(frames)

        key = cv2.waitKey(delay=1)
        if key == ord("q"):
            break

    device.stop()
    device.close()


def sendDataToCP(activeNodes):
    msg = json.dumps(activeNodes) + "\n"
    cpPort.write(bytearray(map(ord, msg)))


def sendData(df):

    filtered_df = df[(df["class"] != 32) & (df["confidence"] > CONFIDENCE_THRESHOLD)][
        ["xmin", "ymin", "xmax", "ymax"]
    ]
    filtered_df = filtered_df.reset_index()

    for i, node in enumerate(nodes):
        for _, detection in filtered_df.iterrows():
            if (
                node["x"] > detection["xmin"]
                and node["x"] < detection["xmax"]
                and node["y"] > detection["ymin"]
                and node["y"] < detection["ymax"]
            ):
                # Only reset it if it hasn't been triggered in a while
                if (
                    time.monotonic() - node_activations_connections[i]
                    > NODE_ACTIVATION_TIMEOUT
                ):
                    node_activations_connections[i] = time.monotonic()

                if (
                    time.monotonic() - node_activations_single[i]
                    > NODE_ACTIVATION_TIMEOUT
                ):
                    node_activations_single[i] = time.monotonic()
                    print("reseting node ", i)
    active_nodes_con = []
    for node_idx, activation_time in enumerate(node_activations_connections):
        if time.monotonic() - activation_time > NODE_ACTIVATION_TIMEOUT:
            continue
        active_nodes_con.append(
            {"node_idx": node_idx, "activation_time": activation_time}
        )

    active_nodes_con = list(
        sorted(active_nodes_con, key=lambda node: node["activation_time"])
    )

    if len(active_nodes_con) > 1:
        connections_to_trigger = []
        for i, n1 in enumerate(active_nodes_con):
            for n2 in active_nodes_con[i + 1 :]:
                print("triggering nodes ", n1, n2)
                con = Connection(n1["node_idx"], n2["node_idx"])

                if con not in connections:
                    connections.append(con)
                    connections_to_trigger.append(con)
                    print("starting")
                    playsound("startaudio.wav", False)

                con_idx = connections.index(con)

                if (
                    time.monotonic() - connections[con_idx].last_trigger
                    > NODE_ACTIVATION_TIMEOUT - TRIGGER_DELAY
                ):
                    connections[con_idx].last_trigger = time.monotonic()
                    connections_to_trigger.append(connections[con_idx])
                    playsound("loopaudio.wav", False)

        print("to trigger ", connections_to_trigger)
        to_send = list(
            map(lambda con: {"n1": con.n1, "n2": con.n2}, connections_to_trigger)
        )

        print(to_send)

        sendDataToCP(to_send)

    else:
        for i, node_activation in enumerate(node_activations_single):
            if time.monotonic() - node_activation < TRIGGER_DELAY:

                print("triggering node ", i)
                sendDataToCP(i)


showIrImage = False
saveImage = False
showImage = True
NODE_ACTIVATION_TIMEOUT = 3.5
CONFIDENCE_THRESHOLD = 0.25

TRIGGER_DELAY = 0.25

nodes = [
    {"x": 348, "y": 694},
    {"x": 792, "y": 1051},  # Done
    {"x": 737, "y": 500},  # Done
    {"x": 755, "y": 85},  # This
    {"x": 1035, "y": 694},  # Done
    {"x": 1205, "y": 211},  # Done
    {"x": 1647, "y": 1048},  # Done
    {"x": 1523, "y": 451},  # Done
]
node_activations_connections = [
    time.monotonic() - NODE_ACTIVATION_TIMEOUT for _ in nodes
]
node_activations_single = [time.monotonic() - NODE_ACTIVATION_TIMEOUT for _ in nodes]


class Connection:
    def __init__(self, n1, n2, last_trigger=time.monotonic()) -> None:
        self.n1 = n1
        self.n2 = n2
        self.last_trigger = last_trigger

    def __eq__(self, other) -> bool:
        return (self.n1 == other.n1 and self.n2 == other.n2) or (
            self.n1 == other.n2 and self.n2 == other.n1
        )

    def __repr__(self) -> str:
        return f"n1: {self.n1}, n2: {self.n2}, time: {time.monotonic}, last_trigger: {self.last_trigger}"


connections = []

last_ambient = time.monotonic()
if __name__ == "__main__":
    playsound("startaudio.wav", False)
    playsound("loopaudio.wav", False)
    onYoloData(sendData)
