#pragma once

#include <cstdint>

namespace VisualizationTools
{
    struct Point2dOffsets
    {
        /**
         * Required.
         */
        std::int8_t m_x;
        /**
         * Required.
         */
        std::int8_t m_y;
        /**
         * Optional, -1 indicates not present.
         */
        std::int8_t m_size;
        /**
         * Optional, -1 indicates not present.
         */
        std::int8_t m_color;
    };
}