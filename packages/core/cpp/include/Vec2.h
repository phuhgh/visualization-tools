# pragma once

#include "Mat3.h"

namespace VisualizationTools
{
    template<typename T>
    struct Vec2
    {
    public:
        T m_x;
        T m_y;

        void Mat3Multiply(Mat3<T> & _mat3);
        void Mat3Multiply(Mat3<T> & _mat3, Vec2<T> & o_result);
    };
}