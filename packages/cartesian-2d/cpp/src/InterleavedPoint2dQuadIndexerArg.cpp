#include "../include/InterleavedPoint2dQuadIndexerArg.h"

template<typename T>
constexpr std::uint64_t getOffsets()
{
    static_assert(sizeof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>) < 0xFF);
    static_assert(offsetof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>, m_connector) < 0xFF);
    static_assert(offsetof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>, m_displayDefaults) < 0xFF);
    static_assert(offsetof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>, m_offsets) < 0xFF);
    static_assert(offsetof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>, m_sizeTransform) < 0xFF);
    static_assert(offsetof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>, m_worldTransform) < 0xFF);
    static_assert(std::is_standard_layout<VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>>::value);
    static_assert(std::is_trivially_copyable<VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>>::value);

    std::uint64_t offsets{ 0 };
    // size of whole first
    offsets |= sizeof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>);
    // skip the first member, the offset is always zero
    offsets |= static_cast<std::uint64_t>(offsetof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>, m_connector)) << 8;
    offsets |= static_cast<std::uint64_t>(offsetof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>, m_displayDefaults)) << 16;
    offsets |= static_cast<std::uint64_t>(offsetof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>, m_offsets)) << 24;
    offsets |= static_cast<std::uint64_t>(offsetof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>, m_sizeTransform)) << 32;
    offsets |= static_cast<std::uint64_t>(offsetof(VisualizationTools::Bindings::InterleavedPoint2dQuadIndexerArg<T>, m_worldTransform)) << 40;

    return offsets;
}

[[maybe_unused]]
double f32Interleaved2dQuadIndexer_getOffsets()
{
    // not ideal but we're using less than 52 bits, returning uint64_t would require downstream to use the same compile flag for BigInt...
    return static_cast<double>(getOffsets<float>());
}

[[maybe_unused]]
double f64Interleaved2dQuadIndexer_getOffsets()
{
    return static_cast<double>(getOffsets<double>());
}