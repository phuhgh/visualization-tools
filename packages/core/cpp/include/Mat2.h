#pragma once

#include <array>

namespace VisualizationTools
{
    template<typename T>
    struct Mat2
    {
    public:
        std::array<T, 4> m_elements;
        explicit Mat2(std::array<T, 4> && _elements);
        T GetVec2MultiplyX(T x);
    };
}