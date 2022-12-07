import numpy as np
import pandas as pd
import cv2
import json
import sys
from pylibfreenect2 import Freenect2, SyncMultiFrameListener
from pylibfreenect2 import FrameType, Registration, Frame
import torch

import adafruit_board_toolkit.circuitpython_serial
import serial

dataport = adafruit_board_toolkit.circuitpython_serial.data_comports()[0]
cpPort = serial.Serial(dataport.device)


def irFrameListener(frameType, frame):
    print(frameType)


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

    model = torch.hub.load("ultralytics/yolov5", "yolov5s", pretrained=True)

    while True:
        frames = listener.waitForNewFrame()
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

        if showImage:
            for im in results.ims:
                cv2.imshow("infered", im)

        if showIrImage:
            cv2.imshow("ir", ir.asarray() / 65535.0)
            # cv2.imshow("depth", depth.asarray() / 4500.0)
            # cv2.imshow("color", cv2.resize(color.asarray(), (int(1920 / 3), int(1080 / 3))))
            # cv2.imshow("registered", registered.asarray(np.uint8))

        callback(results.pandas().xyxy[0])

        listener.release(frames)

        key = cv2.waitKey(delay=1)
        if key == ord("q"):
            break

    device.stop()
    device.close()


def sendDataToCP(activeNodes):
    msg = json.dumps(activeNodes) + "\n"
    print(msg)
    cpPort.write(bytearray(map(ord, msg)))


def sendData(df):
    nodes = [{"x": 500, "y": 500}]

    filtered_df = df[(df["class"] == 0) & (df["confidence"] > 0.7)][
        ["xmin", "ymin", "xmax", "ymax"]
    ]
    filtered_df = filtered_df.reset_index()

    active_nodes = set()
    for i, node in enumerate(nodes):
        for _, detection in filtered_df.iterrows():
            if (
                node["x"] > detection["xmin"]
                and node["x"] < detection["xmax"]
                and node["y"] > detection["ymin"]
                and node["y"] < detection["ymax"]
            ):
                active_nodes.add(i)
    sendDataToCP(list(active_nodes))


showImage = True
showIrImage = False

if __name__ == "__main__":
    onYoloData(sendData)
