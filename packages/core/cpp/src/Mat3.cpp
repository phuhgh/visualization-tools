#include "../include/Mat3.h"

template<typename T>
VisualizationTools::Mat3<T>::Mat3(std::array<T, 9> && _elements)
        : m_elements(_elements)
{
}

template
struct VisualizationTools::Mat3<float>;

template
struct VisualizationTools::Mat3<double>;
