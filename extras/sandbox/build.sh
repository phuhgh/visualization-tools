#!/bin/bash

# and the prize for dumbest shell script goes to:

if [ "$1" = "clean" ]; then
  echo "Deleting build dir"
  rm -rf build
  mkdir build
fi

env node node_modules/rc-js-util/scripts/extract-cpp-names.js node_modules/@visualization-tools/cartesian-2d/bin/cpp.module > exported-names.txt || exit
cd build || exit

if [ "$2" = "release" ]; then
  emcmake cmake -G Ninja .. -DCMAKE_BUILD_TYPE=Release -DBUILD_VISUALIZATION_SANDBOX=1 || exit
else
  emcmake cmake -G Ninja .. -DCMAKE_BUILD_TYPE=Debug -DBUILD_VISUALIZATION_SANDBOX=1 || exit
fi

cmake --build . || exit
cd .. || exit
