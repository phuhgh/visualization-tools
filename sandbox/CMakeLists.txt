cmake_minimum_required(VERSION 3.17)
project(VisualizationToolsSandbox)

# specify the C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

if (${BUILD_VISUALIZATION_SANDBOX})
    if ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
        message("Creating optimized build")
    else ()
        message("Creating debug build")
        set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -DDEBUG_MODE")
    endif ()

    # nuke the caches
    set(RC_JS_EXPORTED_NAMES "" CACHE INTERNAL "")
    set(RC_JS_BUILD_LIST "" CACHE INTERNAL "")
endif ()

if (NOT "VisualizationToolsCartesian2d" IN_LIST RC_JS_BUILD_LIST)
    add_subdirectory(node_modules/@visualization-tools/cartesian-2d)
endif ()

# the sandbox doesn't need any source, but cmake requires it
set(SOURCE_FILES cpp/src/dummy.cpp)

string(SUBSTRING "${RC_JS_EXPORTED_NAMES}" 1 -1 EXPORTED_NAMES)
string(REPLACE ";" "','" EXPORTED_NAMES "${EXPORTED_NAMES}")
set(CommonLinkFlags "-s EXPORTED_FUNCTIONS=['${EXPORTED_NAMES}'] -s ENVIRONMENT=web -s ALLOW_MEMORY_GROWTH -s IMPORTED_MEMORY -s MODULARIZE=1 -s LLD_REPORT_UNDEFINED --no-entry -gsource-map --source-map-base=./")
set(CommonCompileFlags "")

# sandbox test module
add_executable(sandbox-module "${SOURCE_FILES}")

if ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
    set(CommonLinkFlags "-O3 ${CommonLinkFlags} -s ASSERTIONS=0")
    set(CommonCompileFlags "-O3 ${OPTIMIZATION_FLAGS}")
    set_property(TARGET sandbox-module PROPERTY INTERPROCEDURAL_OPTIMIZATION TRUE)
else ()
    set(CommonLinkFlags " -O0 -g3 ${CommonLinkFlags} -s ASSERTIONS=2 -s SAFE_HEAP -fsanitize=undefined")
    set(CommonCompileFlags " -O0 -g3 -fsanitize=undefined")
endif ()

set_target_properties(sandbox-module PROPERTIES
        LINK_FLAGS "${CommonLinkFlags} -s INITIAL_MEMORY=8192kb"
        COMPILE_FLAGS "${CommonCompileFlags}"
        )
target_link_libraries(sandbox-module PUBLIC VisualizationToolsCartesian2d)