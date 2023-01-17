project(ncnn-webassembly-nanodet)

cmake_minimum_required(VERSION 3.10)

set(CMAKE_BUILD_TYPE release)

if(NOT WASM_FEATURE)
    message(FATAL_ERROR "You must pass cmake option -DWASM_FEATURE and possible values are basic, simd, threads and simd-threads")
endif()

set(ncnn_DIR "/Users/sasha/Documents/code/repos/ncnn/build-${WASM_FEATURE}/install/lib/cmake/ncnn")
find_package(ncnn REQUIRED)

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -s FORCE_FILESYSTEM=1 -s INITIAL_MEMORY=256MB -s EXIT_RUNTIME=1 -sMODULARIZE=1 -s EXPORT_NAME='createNanoDet' -sEXPORTED_RUNTIME_METHODS=UTF8ToString")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s FORCE_FILESYSTEM=1 -s INITIAL_MEMORY=256MB -s EXIT_RUNTIME=1 -sMODULARIZE=1 -s EXPORT_NAME='createNanoDet' -sEXPORTED_RUNTIME_METHODS=UTF8ToString")
set(CMAKE_EXECUTBLE_LINKER_FLAGS "${CMAKE_EXECUTBLE_LINKER_FLAGS} -s FORCE_FILESYSTEM=1 -s INITIAL_MEMORY=256MB -s EXIT_RUNTIME=1 -sMODULARIZE=1 -s EXPORT_NAME='createNanoDet' -sEXPORTED_RUNTIME_METHODS=UTF8ToString")

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -sEXPORTED_FUNCTIONS=['_nanodet_ncnn','_malloc','_free'] --embed-file ${CMAKE_CURRENT_SOURCE_DIR}/assets@.")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -sEXPORTED_FUNCTIONS=['_nanodet_ncnn','_malloc','_free'] --embed-file ${CMAKE_CURRENT_SOURCE_DIR}/assets@.")
set(CMAKE_EXECUTBLE_LINKER_FLAGS "${CMAKE_EXECUTBLE_LINKER_FLAGS} -sEXPORTED_FUNCTIONS=['_nanodet_ncnn','_malloc','_free'] --embed-file ${CMAKE_CURRENT_SOURCE_DIR}/assets@.")

if(${WASM_FEATURE} MATCHES "threads")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -fopenmp -pthread -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=4")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fopenmp -pthread -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=4")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -fopenmp -pthread -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=4")
endif()

add_executable(nanodet-${WASM_FEATURE} nanodet.cpp nanodetncnn.cpp)
target_link_libraries(nanodet-${WASM_FEATURE} ncnn)
