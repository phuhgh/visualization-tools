#include "../include/InterleavedLine2dQuadIndexer.h"

// FIXME this doesn't handle point sizes
template<typename T>
void interleaved2dLineQuadIndexer_index
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


    for (size_t i = connector.GetStart(), iEnd = connector.GetEnd() - 1; i < iEnd; ++i)
    {
        VisualizationTools::Vec2<T> p1{ connector.GetValue(i, offsets.m_x), connector.GetValue(i, offsets.m_y) };
        VisualizationTools::Vec2<T> p2{ connector.GetValue(i + 1, offsets.m_x), connector.GetValue(i + 1, offsets.m_y) };

        p1.Mat3Multiply(worldTransform);
        p2.Mat3Multiply(worldTransform);

        VisualizationTools::Range2d<float> range
                {
                        static_cast<float> (p1.m_x),
                        static_cast<float> (p2.m_x),
                        static_cast<float> (p1.m_y),
                        static_cast<float> (p2.m_y)
                };
        range.EnsureAABB();

        quadTree.InsertRange(range, VisualizationTools::QuadElement{ _entityId, static_cast<std::uint32_t>(i), _filterMask });
    }
}

[[maybe_unused]]
void f32Interleaved2dLineQuadIndexer_index
        (
                VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<float> * _arg,
                std::uint32_t _entityId,
                std::uint32_t _filterMask
        )
{
    return interleaved2dLineQuadIndexer_index<float>(_arg, _entityId, _filterMask);
}

[[maybe_unused]]
void f64Interleaved2dLineQuadIndexer_index
        (
                VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<double> * _arg,
                std::uint32_t _entityId,
                std::uint32_t _filterMask
        )
{
    return interleaved2dLineQuadIndexer_index<double>(_arg, _entityId, _filterMask);
}