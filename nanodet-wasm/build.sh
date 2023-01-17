../../emsdk/emsdk activate
source ../../emsdk/emsdk_env.sh

mkdir build
rm -rf ./build
mkdir build
cd build

cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=basic ..
make -j16
cp nanodet* ../../comp-node/src/



