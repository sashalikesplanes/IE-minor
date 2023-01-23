cmake_minimum_required(VERSION 3.10)

# set the project name and version
project(KinectNN VERSION 1.0)

# specify the C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

#add_subdirectory(MathFunctions)

add_executable(KinectNN main.cpp)

target_include_directories(Tutorial PUBLIC
                           "${PROJECT_BINARY_DIR}"
#                           "${PROJECT_SOURCE_DIR}/MathFunctions"
                           )

