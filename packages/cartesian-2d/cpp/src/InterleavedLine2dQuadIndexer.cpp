#include "../include/InterleavedLine2dQuadIndexer.h"

// FIXME this doesn't handle point sizes
template<typename T>
void interleaved2dLineQuadIndexer_index
        (
                VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T> * _arg,
                std::uint32_t _entityId,
                std::uint32_t _filterMask,
                VisualizationTools::Transforms::ICartesian2dUserTransform<T> * _transformX,
                VisualizationTools::Transforms::ICartesian2dUserTransform<T> * _transformY
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

        _transformX->ForwardTransformX(p1);
        _transformY->ForwardTransformY(p1);
        _transformX->ForwardTransformX(p2);
        _transformY->ForwardTransformY(p2);

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
    auto transformX = VisualizationTools::Bindings::getUserTransform<float>(_arg->m_displayOptions.m_xTransform);
    auto transformY = VisualizationTools::Bindings::getUserTransform<float>(_arg->m_displayOptions.m_yTransform);

    return interleaved2dLineQuadIndexer_index(_arg, _entityId, _filterMask, transformX, transformY);
}

[[maybe_unused]]
void f64Interleaved2dLineQuadIndexer_index
        (
                VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<double> * _arg,
                std::uint32_t _entityId,
                std::uint32_t _filterMask
        )
{
    auto transformX = VisualizationTools::Bindings::getUserTransform<double>(_arg->m_displayOptions.m_xTransform);
    auto transformY = VisualizationTools::Bindings::getUserTransform<double>(_arg->m_displayOptions.m_yTransform);

    return interleaved2dLineQuadIndexer_index(_arg, _entityId, _filterMask, transformX, transformY);
}