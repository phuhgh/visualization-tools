#pragma once

#include <cmath>
#include "Vec2.h"

namespace VisualizationTools
{
    template<typename T>
    struct Range2d
    {
    public:
        T m_xMin;
        T m_xMax;
        T m_yMin;
        T m_yMax;

    public:
        Range2d() = default;
        Range2d(T _xMin, T _xMax, T _yMin, T _yMax);
        Range2d(Vec2<T> & _r1, Vec2<T> & _r2);
        bool DoesRangeIntersect(Range2d & _range) const;
        bool IsPointInRange(Vec2<T> & _point) const;
        T GetXRange() const;
        T GetYRange() const;
        void EnsureAABB();

        Range2d<T> GetNw() const;
        Range2d<T> GetNe() const;
        Range2d<T> GetSw() const;
        Range2d<T> GetSe() const;
    };
}
