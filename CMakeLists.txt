cmake_minimum_required(VERSION 3.17)
project(VisualizationTools)

set(RC_JS_EXPORTED_NAMES "" CACHE INTERNAL "")
set(RC_JS_BUILD_LIST "" CACHE INTERNAL "")

if (NOT "VisualizationToolsCartesian2d" IN_LIST RC_JS_BUILD_LIST)
    add_subdirectory(packages/cartesian-2d)
endif ()

if (NOT "VisualizationToolsCore" IN_LIST RC_JS_BUILD_LIST)
    add_subdirectory(packages/core)
endif ()

# the sandbox may not be exported
add_subdirectory(extras/sandbox)