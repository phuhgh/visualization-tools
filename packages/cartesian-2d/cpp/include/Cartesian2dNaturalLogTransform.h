#pragma once

#include <cmath>
#include <Vec2.h>
#include "ICartesian2dUserTransform.h"

namespace VisualizationTools::Transforms
{
    template<typename T>
    class Cartesian2dNaturalLogTransform
            : public ICartesian2dUserTransform<T>
    {
    public:
        void ForwardTransformX(Vec2<T> & _point) override;
        void ForwardTransformY(Vec2<T> & _point) override;
        void ReverseTransformX(Vec2<T> & _point) override;
        void ReverseTransformY(Vec2<T> & _point) override;
    };
}