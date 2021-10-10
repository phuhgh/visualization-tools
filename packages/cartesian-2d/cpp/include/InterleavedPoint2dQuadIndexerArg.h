#pragma once

#include <emscripten/em_macros.h>
#include <cstddef>
#include <QuadTree.h>
#include <InterleavedConnector.h>
#include <Mat3.h>
#include <Mat2.h>
#include "Point2dOffsets.h"
#include "ICartesian2dUserTransform.h"
#include "Cartesian2dNaturalLogTransform.h"
#include "Cartesian2dIdentityTransform.h"

namespace VisualizationTools::Bindings
{
    template<typename T>
    VisualizationTools::Transforms::ICartesian2dUserTransform<T> * getUserTransform(VisualizationTools::Bindings::ECartesian2dTransform _transform)
    {
        static VisualizationTools::Transforms::Cartesian2dIdentityTransform<T> identityTransform;
        static VisualizationTools::Transforms::Cartesian2dNaturalLogTransform<T> logTransform;

        switch (_transform)
        {
            case VisualizationTools::Bindings::ECartesian2dTransform::Identity:
            {
                return &identityTransform;
            };
            case VisualizationTools::Bindings::ECartesian2dTransform::NaturalLog:
            {
                return &logTransform;
            };
            default:
            {
                JsUtil::Debug::Error("getUserTransform: unexpected transform value");
                return &identityTransform;
            }
        }
    }

    struct InterleavedPoint2dDisplayOptions
    {
        ECartesian2dTransform m_xTransform;
        ECartesian2dTransform m_yTransform;
        uint16_t m_pixelSize;
    };

    template<typename T>
    struct InterleavedPoint2dQuadIndexerArg
    {
        QuadTree<float> * m_quadTree;
        InterleavedConnector<T> const * m_connector;
        InterleavedPoint2dDisplayOptions m_displayOptions;
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