cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_CXX_STANDARD 17)

project(nanodet_demo)

find_package(OpenCV REQUIRED)

set(ncnn_DIR "/Users/sasha/Documents/code/repos/ncnn/build/install/lib/cmake/ncnn/")
find_package(ncnn REQUIRED)
if(NOT TARGET ncnn)
    message(WARNING "ncnn NOT FOUND!  Please set ncnn_DIR environment variable")
else()
    message("ncnn FOUND ")
endif()

include_directories(
    ${OpenCV_INCLUDE_DIRS}
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_BINARY_DIR}
)


add_executable(nanodet_demo main.cpp nanodet.cpp)

target_link_libraries(
    nanodet_demo
    ncnn
    ${OpenCV_LIBS}
)