#include "Vec2.h"

template<typename T>
void VisualizationTools::Vec2<T>::Mat3Multiply(Mat3<T> & _mat, Vec2<T> & o_result)
{
    o_result.m_x = _mat.m_elements[0] * m_x + _mat.m_elements[3] * m_x + _mat.m_elements[6];
    o_result.m_y = _mat.m_elements[1] * m_y + _mat.m_elements[4] * m_y + _mat.m_elements[7];
}

template<typename T>
void VisualizationTools::Vec2<T>::Mat3Multiply(VisualizationTools::Mat3<T> & _mat3)
{
    Mat3Multiply(_mat3, *this);
}

template
struct VisualizationTools::Vec2<float>;

template
struct VisualizationTools::Vec2<double>;
