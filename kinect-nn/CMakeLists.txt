project(KinectNN)

set(OpenCV_DIR "/usr/local/lib/cmake/opencv4/")
find_package(OpenCV REQUIRED)

set(ncnn_DIR "/Users/sasha/Documents/code/repos/ncnn/build/install/lib/cmake/ncnn/")
find_package(ncnn REQUIRED)
if(NOT TARGET ncnn)
    message(WARNING "ncnn NOT FOUND!  Please set ncnn_DIR environment variable")
else()
    message("ncnn FOUND ")
endif()

set(freenect2_DIR "/usr/local/lib/cmake/freenect2/")
find_package(freenect2 REQUIRED)

include_directories(
    ${OpenCV_INCLUDE_DIRS}
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_BINARY_DIR}
    ${freenect2_INCLUDE_DIR}
    ${libfreenect_INCLUDE_DIR}
)

add_executable(KinectNN main.cpp nanodet.cpp)

target_link_libraries(
    KinectNN
    ncnn
    ${OpenCV_LIBS}
    ${freenect2_LIBRARIES}
    "/usr/local/lib/libfreenect_sync.dylib"
)
message(STATUS "libfreenect_LIBRARIES include dir: ${freenect2_LIBRARIES}")
