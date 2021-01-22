#pragma once

#include <cstdint>

namespace VisualizationTools
{
    template<typename TValue>
    struct IIndexedConnector
    {
    public:
        virtual TValue GetValue(size_t _index, int8_t _offset) const = 0;
        virtual size_t GetStart() const = 0;
        virtual void SetStart(size_t _start) = 0;
        virtual size_t GetEnd() const = 0;
        virtual size_t GetLength() const = 0;
        virtual void SetLength(size_t _length) = 0;
        virtual size_t GetMaxLength() const = 0;
        virtual size_t GetBlockSize() const = 0;
    };
}