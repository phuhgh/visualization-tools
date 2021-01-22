#pragma once

#include <span>
#include <vector>
#include "Range2d.h"
#include "Vec2.h"
#include "QuadElement.h"

namespace VisualizationTools
{
    template<typename T>
    class QuadNode
    {

    public:
        QuadNode<T> * m_parent;
        Range2d<T> m_bounds;
        // nwQuad, neQuad, seQuad, swQuad
        QuadNode<T> * m_quads[4];

    public:
        QuadNode();
        QuadNode(QuadNode<T> * _parent, Range2d<T> _bounds);
        ~QuadNode();
        Range2d<T> SubdivideRange(std::uint8_t _childIndex);
        size_t GetElementCount() const;
        void PushElement(QuadElement _element);
        std::vector<QuadElement> const & GetElements() const;
        size_t GetTotalElementCount() const;

    private:
        std::vector<QuadElement> m_elements;
    };
}
