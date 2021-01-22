#pragma once

#include <cstdlib>
#include <cstdint>

namespace VisualizationTools
{
    struct QuadElement
    {
        std::uint32_t m_elementId;
        std::uint32_t m_dataId;
        std::uint32_t m_filterMask;
    };
}