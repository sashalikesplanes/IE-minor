#include <opencv2/opencv.hpp>
#include <libfreenect2/libfreenect2.hpp>
#include <libfreenect2/frame_listener_impl.h>
#include <libfreenect2/registration.h>
#include <libfreenect2/packet_pipeline.h>
#include <libfreenect2/logger.h>
#include <libfreenect/libfreenect_sync.h>
#include <unistd.h>
#include <iostream>
#include <thread>
#include <mutex>
#include <random>
#include "nanodet.h"

std::string KINECTV2_SERIAL = "255315733947";

// Global matricies for sharing image data between threads
cv::Mat latest_window_image;
cv::Mat latest_corridor_image;
std::mutex window_image_lock;
std::mutex corridor_image_lock;

// Global shutdown flag
bool shutdown = false;

// Global Freenect2 objects
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

        // Get image data
        listener.waitForNewFrame(frames);
        libfreenect2::Frame *ir = frames[libfreenect2::Frame::Ir];

        // Convert image data
        cv::Mat raw_out(ir->height, ir->width, CV_32FC1, ir->data);
        raw_out.convertTo(raw_out_scaled, CV_8UC1, 255.0 / 4096.0);
        cv::merge(std::vector<cv::Mat>(3, raw_out_scaled), raw_out_scaled_3c);

        // Save image data
        window_image_lock.lock();
        raw_out_scaled_3c.copyTo(latest_window_image);
        window_image_lock.unlock();

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
    // [OPTIONS]
    bool start_corridor = false;    // 0001
    bool start_window = false;      // 0010
    bool save_output_image = false; // 0100
    float score_threshold = 0.5;
    float nms_threshold = 0.5;
    float window_prob = 0.5; // Probability of using window camera

    if (argc < 5)
    {
        std::cout << "Usage: ./main <flag> score_threshold nms_threshold window_prob" << std::endl;
        return -1;
    }

    int flag = atoi(argv[1]);

    if (flag & 1)
        start_corridor = true;
    if (flag & 2)
        start_window = true;
    if (flag & 4)
        save_output_image = true;

    score_threshold = std::stof(argv[2]);
    nms_threshold = std::stof(argv[3]);
    window_prob = std::stof(argv[4]);
    // [OPTIONS]

    // Start the KinectV2
    // MUST BE DONE on main thread
    dev = freenect2.openDevice(KINECTV2_SERIAL);
    if (dev == 0)
    {
        std::cout << "Failure connecting to kinect v2" << std::endl;
        shutdown = true;
        return -1;
    }
    dev->setIrAndDepthFrameListener(&listener);
    dev->start();

    // Launch the image fetching threads
    if (start_corridor)
    {
        std::thread corridor_thread(get_corridor_image);
        corridor_thread.detach();
    }

    if (start_window)
    {
        std::thread window_thread(get_window_image);
        window_thread.detach();
    }

    // Init NanoDet
    NanoDet detector = NanoDet("./nanodet.param", "./nanodet.bin", true);

    // Init random number generator
    std::default_random_engine generator;
    std::uniform_real_distribution<float> random_probability(0.0, 1.0);

    while (!shutdown)
    {
        // Get the input image
        cv::Mat input_image;
        float rand_prob = random_probability(generator);
        if (!latest_window_image.empty() && rand_prob < window_prob)
        {
            window_image_lock.lock();
            latest_window_image.copyTo(input_image);
            window_image_lock.unlock();
        }
        else
        {
            corridor_image_lock.lock();
            latest_corridor_image.copyTo(input_image);
            corridor_image_lock.unlock();
        }

        if (input_image.empty())
            continue;

        // Get results
        auto results = detector.resize_detect_and_draw(input_image, save_output_image, score_threshold, nms_threshold);
        std::vector<BoxInfo> dets = std::get<0>(results);
        cv::Mat result_img = std::get<1>(results);

        // Optionally save image
        if (save_output_image && rand_prob < window_prob)
        {
            cv::imwrite("window_result.jpg", result_img);
        }
        else if (save_output_image)
        {
            cv::imwrite("corridor_result.jpg", result_img);
        }

        // Send results
        std::string json_dets;
        if (rand_prob < window_prob)
        {
            json_dets = make_dets_json(dets, "window");
        }
        else
        {
            json_dets = make_dets_json(dets, "corridor");
        }

        std::cout << json_dets << std::endl;
    }

    shutdown = true;
    std::cout << "Shutting down..." << std::endl;
    return 0;
}