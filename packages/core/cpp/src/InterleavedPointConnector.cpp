#include "InterleavedConnector.h"

template<typename T>
VisualizationTools::InterleavedConnector<T>::InterleavedConnector
        (
                JsUtil::SharedArray<T> * _elements,
                size_t _startIndex,
                size_t _length,
                size_t _maxLength,
                size_t _blockElementCount
        )
        :
        m_elements(_elements),
        m_startIndex(_startIndex),
        m_length(_length),
        m_maxLength(_maxLength),
        m_blockElementCount(_blockElementCount)
{
}

template<typename T>
VisualizationTools::InterleavedConnector<T>::~InterleavedConnector() = default;

template<typename T>
T VisualizationTools::InterleavedConnector<T>::GetValue(size_t _index, int8_t _offset) const
{
    return m_elements->GetArray().data()[_index * m_blockElementCount + _offset];
}

template<typename T>
size_t VisualizationTools::InterleavedConnector<T>::GetStart() const
{
    return m_startIndex;
}

template<typename T>
void VisualizationTools::InterleavedConnector<T>::SetStart(size_t _start)
{
    m_startIndex = _start;
}

template<typename T>
size_t VisualizationTools::InterleavedConnector<T>::GetEnd() const
{
    return m_startIndex + m_length;
}

template<typename T>
size_t VisualizationTools::InterleavedConnector<T>::GetLength() const
{
    return m_length;
}

template<typename T>
size_t VisualizationTools::InterleavedConnector<T>::GetMaxLength() const
{
    return m_maxLength;
}

template<typename T>
void VisualizationTools::InterleavedConnector<T>::SetLength(size_t _length)
{
    m_length = _length;
}

template<typename T>
size_t VisualizationTools::InterleavedConnector<T>::GetBlockSize() const
{
    return m_blockElementCount;
}

template
class VisualizationTools::InterleavedConnector<float>;

template
class VisualizationTools::InterleavedConnector<double>;

// generic impl
template<typename T>
VisualizationTools::InterleavedConnector<T> * interleavedPointConnector_createOne
        (
                JsUtil::SharedArray<T> * _elements,
                size_t _startIndex,
                size_t _length,
                size_t _maxLength,
                size_t _blockElementCount
        )
{
    JsUtil::Debug::OnBeforeAllocate();

    return new VisualizationTools::InterleavedConnector<T>(_elements, _startIndex, _length, _maxLength, _blockElementCount);
}

template<typename T>
void interleavedPointConnector_delete(VisualizationTools::InterleavedConnector<T> * _connector)
{
    delete _connector;
}

// float 32 impl
[[maybe_unused]]
VisualizationTools::InterleavedConnector<float> * f32InterleavedConnector_createOne
        (
                VisualizationTools::Bindings::InterleavedConnectorOptions<float> * _options
        )
{
    return interleavedPointConnector_createOne<float>(_options->m_elements, _options->m_startIndex, _options->m_length, _options->m_maxLength, _options->m_blockElementCount);
}

[[maybe_unused]]
void f32InterleavedConnector_setStart(VisualizationTools::InterleavedConnector<float> * _connector, std::uint32_t _start)
{
    _connector->SetStart(_start);
}

[[maybe_unused]]
void f32InterleavedConnector_setLength(VisualizationTools::InterleavedConnector<float> * _connector, std::uint32_t _length)
{
    _connector->SetLength(_length);
}

[[maybe_unused]]
void f32InterleavedConnector_delete(VisualizationTools::InterleavedConnector<float> * _connector)
{
    return interleavedPointConnector_delete(_connector);
}

// float 64 impl
[[maybe_unused]]
VisualizationTools::InterleavedConnector<double> * f64InterleavedConnector_createOne
        (
                VisualizationTools::Bindings::InterleavedConnectorOptions<double> * _options
        )
{
    return interleavedPointConnector_createOne<double>(_options->m_elements, _options->m_startIndex, _options->m_length, _options->m_maxLength, _options->m_blockElementCount);
}

[[maybe_unused]]
void f64InterleavedConnector_setStart(VisualizationTools::InterleavedConnector<double> * _connector, std::uint64_t _start)
{
    _connector->SetStart(_start);
}

[[maybe_unused]]
void f64InterleavedConnector_setLength(VisualizationTools::InterleavedConnector<double> * _connector, std::uint64_t _length)
{
    _connector->SetLength(_length);
}

[[maybe_unused]]
void f64InterleavedConnector_delete(VisualizationTools::InterleavedConnector<double> * _connector)
{
    return interleavedPointConnector_delete(_connector);
}