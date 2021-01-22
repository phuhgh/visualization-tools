#pragma once

#include <array>

namespace VisualizationTools
{
    template<typename T>
    struct Mat3
    {
    public:
        std::array<T, 9> m_elements;

        explicit Mat3(std::array<T, 9> && _elements);
    };
}