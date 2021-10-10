#pragma once

#include <Vec2.h>
#include <cmath>

namespace VisualizationTools::Transforms
{
    template<typename T>
    struct ICartesian2dUserTransform
    {
    public:
        virtual void ForwardTransformX(Vec2<T> & _point) = 0;
        virtual void ForwardTransformY(Vec2<T> & _point) = 0;
        virtual void ReverseTransformX(Vec2<T> & _point) = 0;
        virtual void ReverseTransformY(Vec2<T> & _point) = 0;
    };
}

namespace VisualizationTools::Bindings
{
    enum class ECartesian2dTransform : std::uint8_t
    {
        Identity = 0,
        NaturalLog = 1,
    };
}