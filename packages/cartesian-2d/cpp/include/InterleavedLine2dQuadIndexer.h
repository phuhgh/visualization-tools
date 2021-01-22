#pragma once

#include <emscripten/em_macros.h>
#include <cstddef>
#include "InterleavedPoint2dQuadIndexerArg.h"

extern "C"
{
EMSCRIPTEN_KEEPALIVE
void f32Interleaved2dLineQuadIndexer_index
        (
                VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<float> * _arg,
                std::uint32_t _entityId,
                std::uint32_t _filterMask
        );

EMSCRIPTEN_KEEPALIVE
void f64Interleaved2dLineQuadIndexer_index
        (
                VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<double> * _arg,
                std::uint32_t _entityId,
                std::uint32_t _filterMask
        );
}