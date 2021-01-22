#include "../include/Mat2.h"

template<typename T>
VisualizationTools::Mat2<T>::Mat2(std::array<T, 4> && _elements)
        : m_elements(_elements)
{
}

template<typename T>
T VisualizationTools::Mat2<T>::GetVec2MultiplyX(T x)
{
    return m_elements[0] * x + m_elements[2];
}

template
struct VisualizationTools::Mat2<float>;

template
struct VisualizationTools::Mat2<double>;
