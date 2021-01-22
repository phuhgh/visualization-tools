#!/bin/bash

if [ "$1" = "clean" ]; then
  echo "Deleting build dir"
  rm -rf build
  mkdir build
fi

env node node_modules/rc-js-util/scripts/extract-cpp-names.js bin/cpp.module.js > exported-names.txt || exit
cd build || exit
emcmake cmake -G Ninja .. -DCMAKE_BUILD_TYPE=Debug -DBUILD_VISUALIZATION_TOOLS_CARTESIAN2D_TEST=1 || exit
cmake --build . || exit
cd .. || exit
