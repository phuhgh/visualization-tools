#include "QuadNode.h"

template<typename T>
VisualizationTools::QuadNode<T>::QuadNode()
        : m_parent(nullptr),
          m_bounds({ 0, 0, 0, 0 }),
          m_quads()
{
}

template<typename T>
VisualizationTools::QuadNode<T>::QuadNode
        (
                QuadNode<T> * _parent,
                VisualizationTools::Range2d<T> _bounds
        )
        : m_parent(_parent),
          m_bounds(std::move(_bounds)),
          m_quads()
{
}

template<typename T>
VisualizationTools::QuadNode<T>::~QuadNode()
{
    delete m_quads[0];
    delete m_quads[1];
    delete m_quads[2];
    delete m_quads[3];
}

template<typename T>
VisualizationTools::Range2d<T> VisualizationTools::QuadNode<T>::SubdivideRange(std::uint8_t _childIndex)
{
    if (_childIndex == 0)
    {
        return m_bounds.GetNw();
    }

    if (_childIndex == 1)
    {
        return m_bounds.GetNe();
    }

    if (_childIndex == 2)
    {
        return m_bounds.GetSe();
    }

    return m_bounds.GetSw();
}

template<typename T>
size_t VisualizationTools::QuadNode<T>::GetElementCount() const
{
    return m_elements.size();
}

template<typename T>
size_t VisualizationTools::QuadNode<T>::GetTotalElementCount() const
{
    size_t count = 0;

    if (m_quads[0])
    {
        count += m_quads[0]->GetTotalElementCount();
    }

    if (m_quads[1])
    {
        count += m_quads[1]->GetTotalElementCount();
    }

    if (m_quads[2])
    {
        count += m_quads[2]->GetTotalElementCount();
    }

    if (m_quads[3])
    {
        count += m_quads[3]->GetTotalElementCount();
    }

    return m_elements.size() + count;
}

template<typename T>
void VisualizationTools::QuadNode<T>::PushElement(VisualizationTools::QuadElement _element)
{
    m_elements.push_back(_element);
}

template<typename T>
const std::vector<VisualizationTools::QuadElement> & VisualizationTools::QuadNode<T>::GetElements() const
{
    return m_elements;
}

template
class VisualizationTools::QuadNode<float>;

template
class VisualizationTools::QuadNode<double>;