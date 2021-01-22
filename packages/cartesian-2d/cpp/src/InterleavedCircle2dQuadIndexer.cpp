#include "../include/InterleavedCircle2dQuadIndexer.h"

template<typename T>
void interleaved2dCircleQuadIndexer_index
        (
                VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T> * _arg,
                std::uint32_t _entityId,
                std::uint32_t _filterMask
        )
{
    auto & connector = *_arg->m_connector;
    auto & quadTree = *_arg->m_quadTree;
    auto & worldTransform = _arg->m_worldTransform;
    auto & offsets = _arg->m_offsets;
    auto & sizeTransform = _arg->m_sizeTransform;
    auto & defaultSize = _arg->m_displayDefaults.m_pixelSize;

    if (offsets.m_size == -1)
    {
        for (size_t i = connector.GetStart(), iEnd = connector.GetEnd(); i < iEnd; ++i)
        {
            VisualizationTools::Vec2<T> point{ connector.GetValue(i, offsets.m_x), connector.GetValue(i, offsets.m_y) };
            point.Mat3Multiply(worldTransform);

            VisualizationTools::Range2d<float> range{
                    static_cast<float> (point.m_x - defaultSize),
                    static_cast<float> (point.m_x + defaultSize),
                    static_cast<float> (point.m_y - defaultSize),
                    static_cast<float> (point.m_y + defaultSize)
            };

            quadTree.InsertRange(range, VisualizationTools::QuadElement{ _entityId, static_cast<std::uint32_t>(i), _filterMask });
        }
    }
    else
    {
        for (size_t i = connector.GetStart(), iEnd = connector.GetEnd(); i < iEnd; ++i)
        {
            VisualizationTools::Vec2<T> point{ connector.GetValue(i, offsets.m_x), connector.GetValue(i, offsets.m_y) };
            point.Mat3Multiply(worldTransform);
            T transformedSize = sizeTransform.GetVec2MultiplyX(connector.GetValue(i, offsets.m_size));

            VisualizationTools::Range2d<float> range{
                    static_cast<float> (point.m_x - transformedSize),
                    static_cast<float> (point.m_x + transformedSize),
                    static_cast<float> (point.m_y - transformedSize),
                    static_cast<float> (point.m_y + transformedSize)
            };

            quadTree.InsertRange(range, VisualizationTools::QuadElement{ _entityId, static_cast<std::uint32_t>(i), _filterMask });
        }
    }
}

[[maybe_unused]]
void f32Interleaved2dCircleQuadIndexer_index
        (
                VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<float> * _arg,
                std::uint32_t _entityId,
                std::uint32_t _filterMask
        )
{
    return interleaved2dCircleQuadIndexer_index<float>(_arg, _entityId, _filterMask);
}

[[maybe_unused]]
void f64Interleaved2dCircleQuadIndexer_index
        (
                VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<double> * _arg,
                std::uint32_t _entityId,
                std::uint32_t _filterMask
        )
{
    return interleaved2dCircleQuadIndexer_index<double>(_arg, _entityId, _filterMask);
}