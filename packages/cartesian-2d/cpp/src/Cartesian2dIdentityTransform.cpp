#include "../include/Cartesian2dIdentityTransform.h"

template<typename T>
void VisualizationTools::Transforms::Cartesian2dIdentityTransform<T>::ForwardTransformX(Vec2<T> & _point)
{
}

template<typename T>
void VisualizationTools::Transforms::Cartesian2dIdentityTransform<T>::ForwardTransformY(Vec2<T> & _point)
{
}

template<typename T>
void VisualizationTools::Transforms::Cartesian2dIdentityTransform<T>::ReverseTransformX(Vec2<T> & _point)
{
}

template<typename T>
void VisualizationTools::Transforms::Cartesian2dIdentityTransform<T>::ReverseTransformY(Vec2<T> & _point)
{
}

template
class VisualizationTools::Transforms::Cartesian2dIdentityTransform<float>;

template
class VisualizationTools::Transforms::Cartesian2dIdentityTransform<double>;