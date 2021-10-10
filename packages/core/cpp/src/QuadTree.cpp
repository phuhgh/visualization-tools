#include "QuadTree.h"

template<typename T>
VisualizationTools::QuadTree<T>::QuadTree(std::uint32_t _maxDepth, std::uint32_t _maxElementsPerNode)
        : m_maxDepth(_maxDepth),
          m_maxElementsPerNode(_maxElementsPerNode)
{
}

template<typename T>
void VisualizationTools::QuadTree<T>::SetOptions(std::uint32_t _maxDepth, std::uint32_t _maxElementsPerNode)
{
    m_maxDepth = _maxDepth;
    m_maxElementsPerNode = _maxElementsPerNode;
}

template<typename T>
void VisualizationTools::QuadTree<T>::SetTopLevel(Range2d<T> _aabb)
{
    JsUtil::Debug::OnBeforeAllocate();
    QuadNode<T> quadNode{ nullptr, _aabb };
    m_root = quadNode;
}

template<typename T>
std::uint32_t VisualizationTools::QuadTree<T>::GetTotalElementCount() const
{
    return m_root.GetTotalElementCount();
}

// FIXME assumes little endian, provide compile option
// FIXME allow differing sizes in x & y + differing max depths
template<typename T>
void VisualizationTools::QuadTree<T>::InsertRange(Range2d<T> & _aabb, QuadElement && _element)
{
    // 3 bits per depth level, values correspond to:
    // 4 - nothing checked
    // 3 - nw checked
    // 2 - nw, ne checked
    // 1 - nw, ne, se checked
    // 0 - node cleared
    std::uint64_t iterationState = 0;
    std::uint32_t depthShift = 0;
    std::uint64_t nodeIterationState = 0b100;
    QuadNode<T> * node = &m_root;

    JsUtil::Debug::OnBeforeAllocate();

    // no need to perform an initial bounds check, it happens in the loop

    if (_element.m_filterMask == 0)
    {
        JsUtil::Debug::Error("InsertRange: a filter mask of zero will always produce no results");
    }

    // FIXME no way to "evict" lower elements at the deepest quad, store a priority and check that
    // need not be done in the loop, check on the way out
    for (; depthShift < m_maxDepth * 3;)
    {
        if (nodeIterationState == 0)
        {
            if (depthShift == 0)
            {
                break;
            }
            else
            {
                node = node->m_parent;
                nodeIterationState = (iterationState >> depthShift) & 0b111;
                depthShift -= 3;
                continue;
            }
        }

        if (nodeIterationState == 4)
        {
            // first time seeing this node, try adding to elements (assuming it intersects)
            // this will underflow on the root node, but that's OK because we check for max depth when looping
            if (!node->m_bounds.DoesRangeIntersect(_aabb))
            {
                node = node->m_parent;
                nodeIterationState = (iterationState >> depthShift) & 0b111;
                depthShift -= 3;
                continue;
            }

            if (node->GetElementCount() < m_maxElementsPerNode)
            {
                node->PushElement(_element);
                node = node->m_parent;
                nodeIterationState = (iterationState >> depthShift) & 0b111;
                depthShift -= 3;
                continue;
            }
        }

        // couldn't add to this node, try children
        --nodeIterationState;

        if (!node->m_quads[nodeIterationState])
        {
            node->m_quads[nodeIterationState] = new VisualizationTools::QuadNode<T>(node, node->SubdivideRange(static_cast<std::uint8_t>(nodeIterationState)));
        }

        depthShift += 3;
        iterationState = (iterationState & ~(0b111 << depthShift)) | (nodeIterationState << depthShift);
        node = node->m_quads[nodeIterationState];
        nodeIterationState = 0b100;
    }
}

template<typename T>
inline void appendElements
        (
                const VisualizationTools::QuadNode<T> & _quadNode,
                std::uint32_t _filterMask,
                std::uint32_t & o_foundElements,
                std::span<VisualizationTools::QuadElement> & o_elements
        )
{
    const std::vector<VisualizationTools::QuadElement> & _nodeElements = _quadNode.GetElements();

    for (auto & nodeElement: _nodeElements)
    {
        if (nodeElement.m_filterMask & _filterMask)
        {
            o_elements[o_foundElements] = nodeElement;
            ++o_foundElements;
        }
    }
}

/**
 * Differs slightly from Range2d in that the upper bound is not inclusive.
 */
template<typename T>
bool isPointInRange(VisualizationTools::Range2d<T> & _range, VisualizationTools::Vec2<T> & _point)
{
    return _point.m_x >= _range.m_xMin && _point.m_x < _range.m_xMax && _point.m_y >= _range.m_yMin && _point.m_y < _range.m_yMax;
}

template<typename T>
std::uint32_t VisualizationTools::QuadTree<T>::QueryPoint(Vec2<T> & _point, std::uint32_t _filterMask, std::span<QuadElement> & o_elements) const
{
    QuadNode<T> const * node = &m_root;
    std::uint32_t foundElements = 0;

    if (o_elements.size() < m_maxElementsPerNode * m_maxDepth)
    {
        JsUtil::Debug::Error("QueryPoint: insufficient space allocated for QuadTree search");
        return foundElements;
    }

    if (!node->m_bounds.IsPointInRange(_point))
    {
        return foundElements;
    }

    if (_filterMask == 0)
    {
        JsUtil::Debug::Error("QueryPoint: a filter mask of zero will always produce no results");
    }

    for (;;)
    {
        outerLoopStart:
        appendElements(*node, _filterMask, foundElements, o_elements);

        for (std::uint8_t i = 0; i < 4; ++i)
        {
            if (node->m_quads[i] && isPointInRange(node->m_quads[i]->m_bounds, _point))
            {
                node = node->m_quads[i];
                // look away 🤮
                goto outerLoopStart;
            }
        }

        break;
    }

    return foundElements;
}

template
class VisualizationTools::QuadTree<float>;

template
class VisualizationTools::QuadTree<double>;

[[maybe_unused]]
VisualizationTools::QuadTree<float> * f32QuadTree_createTree(std::uint32_t _maxDepth, std::uint32_t _maxElementsPerNode)
{
    JsUtil::Debug::OnBeforeAllocate();

    return new VisualizationTools::QuadTree<float>(_maxDepth, _maxElementsPerNode);
}

[[maybe_unused]]
void f32QuadTree_setTopLevel
        (
                VisualizationTools::QuadTree<float> * _tree,
                VisualizationTools::Range2d<float> * _range
        )
{
    _tree->SetTopLevel(*_range);
}

static VisualizationTools::QuadElement s_elementArray[4096 * 4]{};

[[maybe_unused]]
std::uint32_t f32QuadTree_queryPoint(VisualizationTools::QuadTree<float> * _tree, float _pointX, float _pointY, std::uint32_t _filterMask)
{
    // good for a 4k screen with 4 elements per quad
    static std::span<VisualizationTools::QuadElement> elements{ s_elementArray, 4096 * 4 };
    VisualizationTools::Vec2<float> point{ _pointX, _pointY };

    return _tree->QueryPoint(point, _filterMask, elements);
}

[[maybe_unused]]
void f32QuadTree_insertRange
        (
                VisualizationTools::QuadTree<float> * _tree,
                VisualizationTools::Range2d<float> * _range,
                VisualizationTools::QuadElement * _quadElement
        )
{
    _tree->InsertRange(*_range, VisualizationTools::QuadElement{ *_quadElement });
}

[[maybe_unused]]
void f32QuadTree_delete(VisualizationTools::QuadTree<float> * _tree)
{
    delete _tree;
}

[[maybe_unused]]
void quadTree_setOptions
        (
                VisualizationTools::QuadTree<float> * _tree,
                std::uint32_t _maxDepth,
                std::uint32_t _maxElementsPerNode
        )
{
    _tree->SetOptions(_maxDepth, _maxElementsPerNode);
}

[[maybe_unused]]
VisualizationTools::QuadElement * quadTree_getResultAddress()
{
    return s_elementArray;
}

[[maybe_unused]]
std::uint32_t quadTree_getQuadElementCount(VisualizationTools::QuadTree<float> * _tree)
{
    return _tree->GetTotalElementCount();
}