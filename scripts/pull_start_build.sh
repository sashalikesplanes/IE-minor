#!/bin/bash

# Starting from a fresh arm32v7/ubuntu:18.04 Docker image
cd /home

# Install necessary system tools (not build dependencies)
apt update

apt install -y cmake g++ wget unzip vim git

# Pull OpenCV code
wget -O opencv.zip https://github.com/opencv/opencv/archive/3.4.9.zip
wget -O opencv_contrib.zip https://github.com/opencv/opencv_contrib/archive/3.4.9.zip
unzip opencv.zip
unzip opencv_contrib.zip

# NCNN - C++ library for running machine learning models
# Key advantage - PyTorch / TensorFlow -> ONNX -> NCNN
# ie basically any machine learning model can be used.
# Pull ncnn repo and dependent repos
git clone https://github.com/Tencent/ncnn.git
cd ncnn
git submodule update --init
cd ..

git clone https://github.com/RangiLyu/nanodet.git

# Start the build of OpenCV, NOTE the version numbers
mkdir -p build
cd build
cmake -DOPENCV_EXTRA_MODULES_PATH=../opencv_contrib-3.4.9/modules -DBUILD_LIST=tracking,imgcodecs,videoio,highgui,features2d,ml,xfeatures2d -DCMAKE_BUILD_TYPE=Release ../opencv-3.4.9
make -j16
make install

cd ../ncnn
mkdir -p build
cd build
cmake  -DCMAKE_BUILD_TYPE=Release -DNCNN_VULKAN=OFF -DNCNN_BUILD_EXAMPLES=OFF ..
make -j16
make install

export ncnn_DIR=/home/ncnn/build/install/lib/cmake/ncnn/
cd ../../nanodet/demo_ncnn
mkdir build && cd build
cmake ..
make -j16

