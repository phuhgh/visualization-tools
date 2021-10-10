<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [OnPlotRequiresUpdate](./core.onplotrequiresupdate.md)

## OnPlotRequiresUpdate class

Used to indicate that a redraw is required, which is performed by [IChartComponent.updateOnNextFrame()](./core.ichartcomponent.updateonnextframe.md)<!-- -->. Multiple calls will be rolled up into a single update.

<b>Signature:</b>

```typescript
export declare class OnPlotRequiresUpdate implements TOnPlotRequiresUpdate 
```
<b>Implements:</b> [TOnPlotRequiresUpdate](./core.tonplotrequiresupdate.md)

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(onPlotRequiresUpdate)](./core.onplotrequiresupdate._constructor_.md) |  | Constructs a new instance of the <code>OnPlotRequiresUpdate</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [callbackKey](./core.onplotrequiresupdate.callbackkey.md) | <code>static</code> | "onPlotRequiresUpdate" |  |
|  [onPlotRequiresUpdate](./core.onplotrequiresupdate.onplotrequiresupdate.md) |  | (plot: [IReadonlyPlot](./core.ireadonlyplot.md)<!-- -->&lt;unknown, unknown&gt;, updateFlag: [EEntityUpdateFlag](./core.eentityupdateflag.md)<!-- -->) =&gt; void |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [emit(plot, updateFlag)](./core.onplotrequiresupdate.emit.md) | <code>static</code> |  |
|  [registerListener(eventService, onEvent)](./core.onplotrequiresupdate.registerlistener.md) | <code>static</code> |  |
