#pragma once

#include <span>
#include <cmath>
#include <cstdint>
#include <Debug.h>
#include <SharedArray.h>
#include "IIndexedConnector.h"

namespace VisualizationTools
{
    template<typename T>
    class InterleavedConnector
            : public IIndexedConnector<T>
    {
    public:
        InterleavedConnector
                (
                        JsUtil::SharedArray<T> * _elements,
                        size_t _startIndex,
                        size_t _length,
                        size_t _maxLength,
                        size_t _blockElementCount
                );
        ~InterleavedConnector();

        // from IPointConnector
        T GetValue(size_t _index, int8_t _offset) const override;
        size_t GetStart() const override;
        void SetStart(size_t _start) override;
        size_t GetEnd() const override;
        size_t GetLength() const override;
        void SetLength(size_t _length) override;
        size_t GetMaxLength() const override;
        size_t GetBlockSize() const override;

    private:
        JsUtil::SharedArray<T> const * const m_elements;
        size_t m_startIndex;
        size_t m_length;
        size_t const m_maxLength;
        size_t const m_blockElementCount;
    };

    namespace Bindings
    {
        template<typename T>
        struct InterleavedConnectorOptions
        {
            JsUtil::SharedArray<T> * m_elements;
            std::uint32_t m_startIndex;
            std::uint32_t m_length;
            std::uint32_t m_maxLength;
            std::uint32_t m_blockElementCount;
        };
    }
}

extern "C"
{
// float 32
EMSCRIPTEN_KEEPALIVE
VisualizationTools::InterleavedConnector<float> * f32InterleavedConnector_createOne
        (
                VisualizationTools::Bindings::InterleavedConnectorOptions<float> * _options
        );

EMSCRIPTEN_KEEPALIVE
void f32InterleavedConnector_setStart
        (
                VisualizationTools::InterleavedConnector<float> * _connector,
                std::uint32_t _start
        );

EMSCRIPTEN_KEEPALIVE
void f32InterleavedConnector_setLength
        (
                VisualizationTools::InterleavedConnector<float> * _connector,
                std::uint32_t _length
        );

EMSCRIPTEN_KEEPALIVE
void f32InterleavedConnector_delete(VisualizationTools::InterleavedConnector<float> * _connector);

// float 64
EMSCRIPTEN_KEEPALIVE
VisualizationTools::InterleavedConnector<double> * f64InterleavedConnector_createOne
        (
                VisualizationTools::Bindings::InterleavedConnectorOptions<double> * _options
        );

EMSCRIPTEN_KEEPALIVE
void f64InterleavedConnector_setStart
        (
                VisualizationTools::InterleavedConnector<double> * _connector,
                std::uint64_t _start
        );

EMSCRIPTEN_KEEPALIVE
void f64InterleavedConnector_setLength
        (
                VisualizationTools::InterleavedConnector<double> * _connector,
                std::uint64_t _length
        );

EMSCRIPTEN_KEEPALIVE
void f64InterleavedConnector_delete(VisualizationTools::InterleavedConnector<double> * _connector);
}
