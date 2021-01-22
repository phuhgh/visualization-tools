cmake_minimum_required(VERSION 3.17)
project(VisualizationToolsCartesian2d)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

if (${BUILD_VISUALIZATION_TOOLS_CARTESIAN2D_TEST})
    set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -DDEBUG_MODE")
    # nuke the caches
    set(RC_JS_EXPORTED_NAMES "" CACHE INTERNAL "")
    set(RC_JS_BUILD_LIST "" CACHE INTERNAL "")
    set(RC_JS_BUILD_FLAGS "" CACHE INTERNAL "")
    set(RC_JS_LINK_FLAGS "" CACHE INTERNAL "")
endif ()

if (NOT "VisualizationToolsCartesian2d" IN_LIST RC_JS_BUILD_LIST)
    file(READ exported-names.txt LOCAL_NAMES)
    set(RC_JS_EXPORTED_NAMES "${RC_JS_EXPORTED_NAMES}" "${LOCAL_NAMES}" CACHE INTERNAL "")
    set(RC_JS_BUILD_LIST "${RC_JS_BUILD_LIST}" "VisualizationToolsCartesian2d" CACHE INTERNAL "")
endif ()

if (NOT "VisualizationToolsCore" IN_LIST RC_JS_BUILD_LIST)
    add_subdirectory(node_modules/@visualization-tools/core)
endif ()

set(SOURCE_FILES
        cpp/src/InterleavedLine2dQuadIndexer.cpp
        cpp/src/InterleavedCircle2dQuadIndexer.cpp
        cpp/src/InterleavedPoint2dQuadIndexerArg.cpp
        )

if (${BUILD_VISUALIZATION_TOOLS_CARTESIAN2D_TEST})
    string(SUBSTRING "${RC_JS_EXPORTED_NAMES}" 1 -1 EXPORTED_NAMES)
    string(REPLACE ";" "','" EXPORTED_NAMES "${EXPORTED_NAMES}")
    set(CommonLinkFlags "-O0 -g3 -s WASM_BIGINT=1 -s EXPORTED_FUNCTIONS=['${EXPORTED_NAMES}'] -s ENVIRONMENT=web -s ASSERTIONS=2 -s ALLOW_MEMORY_GROWTH -s IMPORTED_MEMORY -s MODULARIZE=1 -s LLD_REPORT_UNDEFINED --no-entry -gsource-map --source-map-base=./")
    set(CommonCompileFlags "-O0 -g3")

    # asan stack test module
    add_executable(asan-test-module "${SOURCE_FILES}")
    set_target_properties(asan-test-module PROPERTIES
            LINK_FLAGS "${CommonLinkFlags} -fsanitize=address -fsanitize=undefined -s EXIT_RUNTIME=1"
            COMPILE_FLAGS "${CommonCompileFlags} -fsanitize=address -fsanitize=undefined"
            )
    target_link_libraries(asan-test-module PUBLIC VisualizationToolsCore JsUtil)
    target_include_directories(asan-test-module PUBLIC "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/cpp/include>")

    # safe heap test module
    add_executable(safe-heap-module "${SOURCE_FILES}")
    set_target_properties(safe-heap-module PROPERTIES
            LINK_FLAGS "${CommonLinkFlags} -s INITIAL_MEMORY=8192kb -s SAFE_HEAP -fsanitize=undefined"
            COMPILE_FLAGS "${CommonCompileFlags} -fsanitize=undefined"
            )
    target_link_libraries(safe-heap-module PUBLIC VisualizationToolsCore JsUtil)
    target_include_directories(safe-heap-module PUBLIC "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/cpp/include>")
endif ()

# create library
add_library(VisualizationToolsCartesian2d STATIC "${SOURCE_FILES}")
target_link_libraries(VisualizationToolsCartesian2d PUBLIC VisualizationToolsCore JsUtil)

target_include_directories(VisualizationToolsCartesian2d
        PUBLIC
        "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/cpp/include>"
        "$<INSTALL_INTERFACE:include>"
        )