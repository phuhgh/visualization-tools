#include "../include/Cartesian2dNaturalLogTransform.h"

template<typename T>
void VisualizationTools::Transforms::Cartesian2dNaturalLogTransform<T>::ForwardTransformX(Vec2<T> & _point)
{
    _point.m_x = std::log(_point.m_x);
}

template<typename T>
void VisualizationTools::Transforms::Cartesian2dNaturalLogTransform<T>::ForwardTransformY(Vec2<T> & _point)
{
    _point.m_y = std::log(_point.m_y);
}

template<typename T>
void VisualizationTools::Transforms::Cartesian2dNaturalLogTransform<T>::ReverseTransformX(Vec2<T> & _point)
{
    _point.m_x = std::exp(_point.m_x);
}

template<typename T>
void VisualizationTools::Transforms::Cartesian2dNaturalLogTransform<T>::ReverseTransformY(Vec2<T> & _point)
{
    _point.m_y = std::exp(_point.m_y);
}

template
class VisualizationTools::Transforms::Cartesian2dNaturalLogTransform<float>;

template
class VisualizationTools::Transforms::Cartesian2dNaturalLogTransform<double>;