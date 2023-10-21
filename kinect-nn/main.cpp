#include <opencv2/opencv.hpp>
#include <libfreenect2/libfreenect2.hpp>
#include <libfreenect2/frame_listener.hpp>
#include <libfreenect2/frame_listener_impl.h>
#include <libfreenect2/registration.h>
#include <libfreenect2/packet_pipeline.h>
#include <libfreenect2/logger.h>
#include <unistd.h>
#include <iostream>
#include <signal.h>
#include <thread>
#include <memory>
#include <mutex>
#include <random>
#include "nanodet.h"


int NUM_CAMS = 2;
std::array<std::string, 2> KINECTV2_SERIALS = { "255315733947", "000304760647",};
// Global matricies for sharing image data between threads
std::array<cv::Mat, 2> latest_images;
std::array<std::mutex, 2> image_locks;
libfreenect2::Freenect2 freenect2;
std::array<libfreenect2::Freenect2Device *, 2> devices = { 0, 0 };

// Global shutdown flag
bool shutdown = false;
void sigint_handler(int s)
{
    shutdown = true;
    for (int i = 0; i < NUM_CAMS; ++i) {
      devices[i]->stop();
      devices[i]->close();
    }
    exit(0);
}

class MyFrameListener0 : public libfreenect2::FrameListener {
public:
  virtual ~MyFrameListener0() {}

  virtual bool onNewFrame(libfreenect2::Frame::Type type, libfreenect2::Frame *frame) override {
    std::cout << "Got frame idx: " << 0 << std::endl;
    if (type != libfreenect2::Frame::Ir) {
      std::cout << "Not IR frame" << std::endl;
      return false;
    }

     cv::Mat raw_out_scaled;
     cv::Mat raw_out_scaled_3c;

    cv::Mat raw_out(frame->height, frame->width, CV_32FC1, frame->data);
    raw_out.convertTo(raw_out_scaled, CV_8UC1, 255.0 / 4096.0);
    cv::merge(std::vector<cv::Mat>(3, raw_out_scaled), raw_out_scaled_3c);


    // Save image data
    image_locks[0].lock();
    raw_out_scaled_3c.copyTo(latest_images[0]);
    image_locks[0].unlock();

    std::cout << "Saved frame idx: " << std::to_string(0) << std::endl;

    return false; 
  }
};
class MyFrameListener1 : public libfreenect2::FrameListener {
public:
  virtual ~MyFrameListener1() {}

  virtual bool onNewFrame(libfreenect2::Frame::Type type, libfreenect2::Frame *frame) override {
    std::cout << "Got frame idx: " << 1 << std::endl;
    if (type != libfreenect2::Frame::Ir) {
      std::cout << "Not IR frame" << std::endl;
      return false;
    }

     cv::Mat raw_out_scaled;
     cv::Mat raw_out_scaled_3c;

    cv::Mat raw_out(frame->height, frame->width, CV_32FC1, frame->data);
    raw_out.convertTo(raw_out_scaled, CV_8UC1, 255.0 / 4096.0);
    cv::merge(std::vector<cv::Mat>(3, raw_out_scaled), raw_out_scaled_3c);


    // Save image data
    image_locks[1].lock();
    raw_out_scaled_3c.copyTo(latest_images[1]);
    image_locks[1].unlock();

    std::cout << "Saved frame idx: " << std::to_string(1) << std::endl;

    return false; 
  }
};


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
    bool save_output_image = false;      // 0100
    bool save_each_output_image = false; // 1000
    float score_threshold = 0.5;
    float nms_threshold = 0.5;
    float window_prob = 0.5; // Probability of using window camera

    if (argc < 5)
    {
        std::cout << "Usage: ./main <flag> score_threshold nms_threshold window_prob" << std::endl;
        return -1;
    }

    int flag = atoi(argv[1]);

    if (flag & 4)
        save_output_image = true;
    if (flag & 8)
        save_each_output_image = true;

    score_threshold = std::stof(argv[2]);
    nms_threshold = std::stof(argv[3]);
    window_prob = std::stof(argv[4]);
    // [OPTIONS]

    // Setup interrupt handler
    shutdown = false;
    signal(SIGINT, sigint_handler);

    std::cout << "Initialized" << std::endl;

    // Start the KinectV2, and attach listeners N.B MUST BE DONE on main thread
    for (int i = 0; i < NUM_CAMS; ++i) {
        devices[i] = freenect2.openDevice(KINECTV2_SERIALS[i]);

        std::cout << "Opened device" << std::endl;
        if (devices[i] == 0)
        {
            std::cerr << "RESTART" << std::endl;
            shutdown = true;
            return -1;
        }
        
        devices[i]->start();
        if (i == 0) {
          MyFrameListener0 myListener;
          devices[i]->setIrAndDepthFrameListener(&myListener);
        } else {
          MyFrameListener1 myListener;
          devices[i]->setIrAndDepthFrameListener(&myListener);
        }
        std::cout << "Started device: " << std::to_string(i) << std::endl;
    }

    // Init NanoDet
    NanoDet detector = NanoDet("./nanodet.param", "./nanodet.bin", true);

    // Init random number generator
    std::default_random_engine generator;
    std::uniform_real_distribution<float> random_probability(0.0, 1.0);

    // Main loop
    int i = 0;
    while (!shutdown)
    {
        i++;
        int cam_idx = i % 2;

        if (latest_images[cam_idx].empty())
            continue;

        // Get the input image from one of the cams
        cv::Mat input_image;
        image_locks[cam_idx].lock();
        latest_images[cam_idx].copyTo(input_image);
        image_locks[cam_idx].unlock();

        // Skip if empty to avoid crashing
        if (input_image.empty())
            continue;

        // Get results
        auto results = detector.resize_detect_and_draw(input_image, save_output_image, score_threshold, nms_threshold);
        std::vector<BoxInfo> dets = std::get<0>(results);
        cv::Mat result_img = std::get<1>(results);

        // Optionally save last image
        if (save_output_image)
        {
            cv::imwrite("camera_" + std::to_string(cam_idx) + "_result.jpg", result_img);
        }

        // Optionally save each image
        if (save_each_output_image)
        {
            cv::imwrite("result_" + std::to_string(cam_idx) + "_" + std::to_string(i) + ".jpg", result_img);
        }

        // Send results
        std::string json_dets = make_dets_json(dets, "camera_" + std::to_string(cam_idx));

        std::cout << json_dets << std::endl;
    }

    for (int i = 0; i < NUM_CAMS; ++i) {
      devices[i]->stop();
      devices[i]->close();
    }

    shutdown = true;
    detector.~NanoDet();
    std::cout << "Shutting down..." << std::endl;
    return 0;
}
