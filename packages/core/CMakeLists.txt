cmake_minimum_required(VERSION 3.17)
project(VisualizationToolsCore)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

if (${BUILD_VISUALIZATION_TOOLS_CORE_TEST})
    set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -DDEBUG_MODE")
    # nuke the caches
    set(RC_JS_EXPORTED_NAMES "" CACHE INTERNAL "")
    set(RC_JS_BUILD_LIST "" CACHE INTERNAL "")
endif ()

if (NOT "VisualizationToolsCore" IN_LIST RC_JS_BUILD_LIST)
    file(READ exported-names.txt LOCAL_NAMES)
    set(RC_JS_EXPORTED_NAMES "${RC_JS_EXPORTED_NAMES}" "${LOCAL_NAMES}" CACHE INTERNAL "")
    set(RC_JS_BUILD_LIST "${RC_JS_BUILD_LIST}" "VisualizationToolsCore" CACHE INTERNAL "")
endif ()

if (NOT "JsUtil" IN_LIST RC_JS_BUILD_LIST)
    add_subdirectory(node_modules/rc-js-util/cpp)
endif ()

set(SOURCE_FILES
        cpp/src/InterleavedPointConnector.cpp
        cpp/src/Mat3.cpp
        cpp/src/Mat2.cpp
        cpp/src/QuadElement.cpp
        cpp/src/QuadNode.cpp
        cpp/src/QuadTree.cpp
        cpp/src/Range2d.cpp
        cpp/src/Vec2.cpp
        cpp/include/IIndexedConnector.h
        )

if (${BUILD_VISUALIZATION_TOOLS_CORE_TEST})
    string(SUBSTRING "${RC_JS_EXPORTED_NAMES}" 1 -1 EXPORTED_NAMES)
    string(REPLACE ";" "','" EXPORTED_NAMES "${EXPORTED_NAMES}")
    set(CommonLinkFlags "-O0 -g3 -s EXPORTED_FUNCTIONS=['${EXPORTED_NAMES}'] -s ENVIRONMENT=web -s ASSERTIONS=2 -s ALLOW_MEMORY_GROWTH -s IMPORTED_MEMORY -s MODULARIZE=1 -s LLD_REPORT_UNDEFINED --no-entry -gsource-map --source-map-base=./")
    set(CommonCompileFlags "-O0 -g3")

    add_executable(asan-test-module "${SOURCE_FILES}")
    set_target_properties(asan-test-module PROPERTIES
            LINK_FLAGS "${CommonLinkFlags} -fsanitize=address -fsanitize=undefined -s EXIT_RUNTIME=1"
            COMPILE_FLAGS "${CommonCompileFlags} -fsanitize=address -fsanitize=undefined"
            )
    target_link_libraries(asan-test-module PUBLIC JsUtil)
    target_include_directories(asan-test-module PUBLIC "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/cpp/include>")

    add_executable(safe-heap-module "${SOURCE_FILES}")
    set_target_properties(safe-heap-module PROPERTIES
            LINK_FLAGS "${CommonLinkFlags} -s INITIAL_MEMORY=8192kb -s SAFE_HEAP -fsanitize=undefined"
            COMPILE_FLAGS "${CommonCompileFlags} -fsanitize=undefined"
            )
    target_link_libraries(safe-heap-module PUBLIC JsUtil)
    target_include_directories(safe-heap-module PUBLIC "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/cpp/include>")
endif ()

# create library
add_library(VisualizationToolsCore STATIC "${SOURCE_FILES}")
target_link_libraries(VisualizationToolsCore PUBLIC JsUtil)
target_include_directories(VisualizationToolsCore
        PUBLIC
        "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/cpp/include>"
        "$<INSTALL_INTERFACE:include>"
        )