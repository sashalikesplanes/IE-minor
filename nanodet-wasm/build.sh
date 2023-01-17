../../emsdk/emsdk activate
source ../../emsdk/emsdk_env.sh

rm -rf ./build/*
cd build

cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=basic ..
make -j16
cp nanodet* ../../comp-node/src/



