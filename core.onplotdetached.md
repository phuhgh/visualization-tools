<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [OnPlotDetached](./core.onplotdetached.md)

## OnPlotDetached class

Emitted on plot being removed from [IChartComponent](./core.ichartcomponent.md)<!-- -->.

<b>Signature:</b>

```typescript
export declare class OnPlotDetached<TRenderer extends TUnknownRenderer> implements TOnPlotDetached<TRenderer> 
```
<b>Implements:</b> [TOnPlotDetached](./core.tonplotdetached.md)<!-- -->&lt;TRenderer&gt;

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(onPlotDetached)](./core.onplotdetached._constructor_.md) |  | Constructs a new instance of the <code>OnPlotDetached</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [callbackKey](./core.onplotdetached.callbackkey.md) | <code>static</code> | "onPlotDetached" |  |
|  [onPlotDetached](./core.onplotdetached.onplotdetached.md) |  | (...args: [TOnPlotDetachedArgs](./core.tonplotdetachedargs.md)<!-- -->&lt;TRenderer&gt;) =&gt; void |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [emit(plot, chart)](./core.onplotdetached.emit.md) | <code>static</code> |  |
|  [registerListener(plot, onEvent)](./core.onplotdetached.registerlistener.md) | <code>static</code> |  |
|  [registerOneTimeListener(plot, onEvent)](./core.onplotdetached.registeronetimelistener.md) | <code>static</code> |  |
