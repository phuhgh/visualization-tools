#pragma once

#include <emscripten/em_macros.h>
#include <cstddef>
#include <QuadTree.h>
#include <InterleavedConnector.h>
#include <Mat3.h>
#include <Mat2.h>
#include "Point2dOffsets.h"

namespace VisualizationTools::Bindings
{
    struct InterleavedPoint2dDisplayDefaults
    {
        uint16_t m_pixelSize;
    };

    template<typename T>
    struct InterleavedPoint2dQuadIndexerArg
    {
        QuadTree<float> * m_quadTree;
        InterleavedConnector<T> const * m_connector;
        InterleavedPoint2dDisplayDefaults m_displayDefaults;
        Point2dOffsets m_offsets;
        Mat2<T> m_sizeTransform;
        Mat3<T> m_worldTransform;
    };
}

extern "C"
{
[[maybe_unused]] EMSCRIPTEN_KEEPALIVE
double f32Interleaved2dQuadIndexer_getOffsets();

[[maybe_unused]] EMSCRIPTEN_KEEPALIVE
double f64Interleaved2dQuadIndexer_getOffsets();
}