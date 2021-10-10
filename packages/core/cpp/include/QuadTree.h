#pragma once

#include <span>
#include <utility>
#include <cstdint>
#include <Debug.h>
#include <emscripten/em_macros.h>
#include "Range2d.h"
#include "Vec2.h"
#include "QuadNode.h"

namespace VisualizationTools
{
    template<typename T>
    class QuadTree
    {
    public:
        QuadTree(std::uint32_t _maxDepth, std::uint32_t _maxElementsPerNode);
        void SetOptions(std::uint32_t _maxDepth, std::uint32_t _maxElementsPerNode);
        void SetTopLevel(Range2d<T> _aabb);
        void InsertRange(Range2d<T> & _aabb, QuadElement && _element);
        std::uint32_t QueryPoint(Vec2<T> & _point, std::uint32_t _filterMask, std::span<QuadElement> & o_elements) const;
        std::uint32_t GetTotalElementCount() const;

    private:
        QuadNode<T> * m_root = nullptr;
        std::uint32_t m_maxDepth;
        std::uint32_t m_maxElementsPerNode;
    };
}

extern "C"
{
EMSCRIPTEN_KEEPALIVE
VisualizationTools::QuadTree<float> * f32QuadTree_createTree
        (
                std::uint32_t _maxDepth,
                std::uint32_t _maxElementsPerNode
        );

EMSCRIPTEN_KEEPALIVE
void f32QuadTree_setTopLevel
        (
                VisualizationTools::QuadTree<float> * _tree,
                VisualizationTools::Range2d<float> * _range
        );

EMSCRIPTEN_KEEPALIVE
std::uint32_t f32QuadTree_queryPoint
        (
                VisualizationTools::QuadTree<float> * _tree,
                float _pointX,
                float _pointY,
                std::uint32_t _filterMask
        );

EMSCRIPTEN_KEEPALIVE
void f32QuadTree_insertRange
        (
                VisualizationTools::QuadTree<float> * _tree,
                VisualizationTools::Range2d<float> * _range,
                VisualizationTools::QuadElement * _quadElement
        );

EMSCRIPTEN_KEEPALIVE
void f32QuadTree_delete(VisualizationTools::QuadTree<float> * _tree);

EMSCRIPTEN_KEEPALIVE
void quadTree_setOptions
        (
                VisualizationTools::QuadTree<float> * _tree,
                std::uint32_t _maxDepth,
                std::uint32_t _maxElementsPerNode
        );

EMSCRIPTEN_KEEPALIVE
std::uint32_t quadTree_getQuadElementCount(VisualizationTools::QuadTree<float> * _tree);

EMSCRIPTEN_KEEPALIVE
VisualizationTools::QuadElement * quadTree_getResultAddress();
}
