#include <iostream>
#include "nanodet.h"
#include <libfreenect2/libfreenect2.hpp>
#include <libfreenect2/frame_listener_impl.h>
#include <libfreenect2/registration.h>
#include <libfreenect2/packet_pipeline.h>
#include <libfreenect2/logger.h>
#include <libfreenect/libfreenect_sync.h>
#include <opencv2/opencv.hpp>
#include <thread>
#include <mutex>
#include <unistd.h>

std::string KINECTV2_SERIAL = "255315733947";

cv::Mat latest_window_image;
cv::Mat latest_corridor_image;
std::mutex window_image_lock;
std::mutex corridor_image_lock;

bool shutdown = false;
libfreenect2::Freenect2 freenect2;
libfreenect2::Freenect2Device *dev = 0;
libfreenect2::SyncMultiFrameListener listener(libfreenect2::Frame::Ir);
libfreenect2::FrameMap frames;

int get_window_image()
{
    while (!shutdown)
    {
        // Setup matrixes
        cv::Mat raw_out_scaled;
        cv::Mat raw_out_scaled_3c;

        listener.waitForNewFrame(frames);
        libfreenect2::Frame *ir = frames[libfreenect2::Frame::Ir];

        cv::Mat raw_out(ir->height, ir->width, CV_32FC1, ir->data);
        raw_out.convertTo(raw_out_scaled, CV_8UC1, 255.0 / 4096.0);
        cv::merge(std::vector<cv::Mat>(3, raw_out_scaled), raw_out_scaled_3c);

        window_image_lock.lock();
        raw_out_scaled_3c.copyTo(latest_window_image);
        window_image_lock.unlock();
        std::cout << "Copied to latest_window_image" << std::endl;

        listener.release(frames);
    }

    dev->stop();
    dev->close();
    return 0;
}

void get_corridor_image()
{
    while (!shutdown)
    {
        // Setup matrixes
        cv::Mat raw_out_scaled;
        cv::Mat raw_out_scaled_3c;

        // Get image data
        char *data;
        unsigned int timestamp;
        freenect_sync_get_video((void **)(&data), &timestamp, 0, FREENECT_VIDEO_IR_8BIT);

        // Convert image data
        cv::Mat raw_out(480, 640, CV_8UC1, data);
        raw_out.convertTo(raw_out_scaled, -1, 10.0);
        cv::merge(std::vector<cv::Mat>(3, raw_out_scaled), raw_out_scaled_3c);

        // Save image data
        corridor_image_lock.lock();
        raw_out_scaled_3c.copyTo(latest_corridor_image);
        corridor_image_lock.unlock();
        std::cout << "Copied to latest_corridor_image" << std::endl;
    }
    freenect_sync_stop();
}

std::string make_dets_json(std::vector<BoxInfo> &dets, std::string source)
{
    std::string json = "JSON$$$[";
    for (int i = 0; i < dets.size(); i++)
    {
        if (i != 0)
            json += ", ";

        json += "{\"source\": \"";
        json += source;
        json += "\", \"label\": ";
        json += std::to_string(dets[i].label);
        json += ", \"score\": ";
        json += std::to_string(dets[i].score);
        json += ", \"x1\": ";
        json += std::to_string(dets[i].x1);
        json += ", \"y1\": ";
        json += std::to_string(dets[i].y1);
        json += ", \"x2\": ";
        json += std::to_string(dets[i].x2);
        json += ", \"y2\": ";
        json += std::to_string(dets[i].y2);
        json += "}";
    }
    json += "]$$$";
    return json;
}

int main(int argc, char **argv)
{
    if (argc < 3)
    {
        std::cout << "Usage: ./main <corridor> <window>" << std::endl;
        return -1;
    }

    dev = freenect2.openDevice(KINECTV2_SERIAL);
    if (dev == 0)
    {
        std::cout << "Failure connecting to kinect v2" << std::endl;
        shutdown = true;
        return -1;
    }
    dev->setIrAndDepthFrameListener(&listener);
    dev->start();

    if (strcmp(argv[1], "1") == 0)
    {
        // Start coridor thread
        std::thread corridor_thread(get_corridor_image);
        corridor_thread.detach();
    }

    if (strcmp(argv[2], "1") == 0)
    {
        // Start window thread
        std::thread window_thread(get_window_image);
        window_thread.detach();
    }

    NanoDet detector = NanoDet("./nanodet.param", "./nanodet.bin", true);

    auto results = detector.resize_detect_and_draw(stacked_ir_window, output_image, score_threshold, nms_threshold);
    mat_lock_window.unlock();
    std::vector<BoxInfo> dets = std::get<0>(results);
    cv::Mat result_img = std::get<1>(results);

    int i = 0;
    while (i < 100)
    {
        usleep(500000); // 0.5 seconds to not overwhelm

        if (!latest_corridor_image.empty())
        {
            corridor_image_lock.lock();
            cv::imwrite("test_corridor.jpg", latest_corridor_image);
            corridor_image_lock.unlock();
            std::cout << "Saved corridor image" << std::endl;
        }

        if (!latest_window_image.empty())
        {
            window_image_lock.lock();
            cv::imwrite("test_window.jpg", latest_window_image);
            window_image_lock.unlock();
            std::cout << "Saved window image" << std::endl;
        }
    }

    shutdown = true;
    std::cout << "Shutting down..." << std::endl;
    return 0;
}