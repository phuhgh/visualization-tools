#include "Range2d.h"

template<typename T>
VisualizationTools::Range2d<T>::Range2d(T _xMin, T _xMax, T _yMin, T _yMax)
        : m_xMin(_xMin),
          m_xMax(_xMax),
          m_yMin(_yMin),
          m_yMax(_yMax)
{
}

template<typename T>
VisualizationTools::Range2d<T>::Range2d(VisualizationTools::Vec2<T> & _r1, VisualizationTools::Vec2<T> & _r2)
        : m_xMin(_r1.m_x),
          m_xMax(_r2.m_x),
          m_yMin(_r1.m_y),
          m_yMax(_r2.m_y)
{
}

template<typename T>
bool VisualizationTools::Range2d<T>::DoesRangeIntersect(Range2d<T> & _range) const
{
    return (std::abs((m_xMin + m_xMax) - (_range.m_xMin + _range.m_xMax)) < (GetXRange() + _range.GetXRange()))
           && (std::abs(((m_yMin + m_yMax)) - (_range.m_yMin + _range.m_yMax)) < (GetYRange() + _range.GetYRange()));
}

template<typename T>
T VisualizationTools::Range2d<T>::GetXRange() const
{
    return m_xMax - m_xMin;
}

template<typename T>
T VisualizationTools::Range2d<T>::GetYRange() const
{
    return m_yMax - m_yMin;
}

template<typename T>
void VisualizationTools::Range2d<T>::EnsureAABB()
{
    if (m_xMin > m_xMax)
    {
        T tmp = m_xMin;
        m_xMin = m_xMax;
        m_xMax = tmp;
    }

    if (m_yMin > m_yMax)
    {
        T tmp = m_yMin;
        m_yMin = m_yMax;
        m_yMax = tmp;
    }
}

template<typename T>
bool VisualizationTools::Range2d<T>::IsPointInRange(VisualizationTools::Vec2<T> & _point) const
{
    return _point.m_x >= m_xMin && _point.m_x <= m_xMax && _point.m_y >= m_yMin && _point.m_y <= m_yMax;
}

template<typename T>
VisualizationTools::Range2d<T> VisualizationTools::Range2d<T>::GetNw() const
{
    return std::move(Range2d<T>{
            m_xMin,
            m_xMin + GetXRange() * 0.5f,
            m_yMin + GetYRange() * 0.5f,
            m_yMax
    });
}

template<typename T>
VisualizationTools::Range2d<T> VisualizationTools::Range2d<T>::GetNe() const
{
    return std::move(Range2d<T>{
            m_xMin + GetXRange() * 0.5f,
            m_xMax,
            m_yMin + GetYRange() * 0.5f,
            m_yMax
    });
}

template<typename T>
VisualizationTools::Range2d<T> VisualizationTools::Range2d<T>::GetSe() const
{
    return std::move(Range2d<T>{
            m_xMin + GetXRange() * 0.5f,
            m_xMax,
            m_yMin,
            m_yMin + GetYRange() * 0.5f
    });
}

template<typename T>
VisualizationTools::Range2d<T> VisualizationTools::Range2d<T>::GetSw() const
{
    return std::move(Range2d<T>{
            m_xMin,
            m_xMin + GetXRange() * 0.5f,
            m_yMin,
            m_yMin + GetYRange() * 0.5f
    });
}

template
struct VisualizationTools::Range2d<float>;

template
struct VisualizationTools::Range2d<double>;