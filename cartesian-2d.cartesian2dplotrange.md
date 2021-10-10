<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/cartesian-2d](./cartesian-2d.md) &gt; [Cartesian2dPlotRange](./cartesian-2d.cartesian2dplotrange.md)

## Cartesian2dPlotRange class

Cartesian 2d data range, range is bounded by [Cartesian2dInteractionHandler](./cartesian-2d.cartesian2dinteractionhandler.md)<!-- -->.

<b>Signature:</b>

```typescript
export declare class Cartesian2dPlotRange<TArray extends TTypedArray> implements ICartesian2dPlotRange<TArray> 
```
<b>Implements:</b> [ICartesian2dPlotRange](./cartesian-2d.icartesian2dplotrange.md)<!-- -->&lt;TArray&gt;

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(maxBounds, dataRange, maxZoom, canvasDims, interactionBounder)](./cartesian-2d.cartesian2dplotrange._constructor_.md) |  | Constructs a new instance of the <code>Cartesian2dPlotRange</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [dataRange](./cartesian-2d.cartesian2dplotrange.datarange.md) |  | Range2d&lt;TArray&gt; |  |
|  [maxBounds](./cartesian-2d.cartesian2dplotrange.maxbounds.md) |  | Range2d&lt;TArray&gt; |  |
|  [minRange](./cartesian-2d.cartesian2dplotrange.minrange.md) |  | Range2d&lt;TArray&gt; |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [createOneF32(maxBounds, dataRange, maxZoom, canvasDims)](./cartesian-2d.cartesian2dplotrange.createonef32.md) | <code>static</code> |  |
|  [createOneF64(maxBounds, dataRange, maxZoom, canvasDims)](./cartesian-2d.cartesian2dplotrange.createonef64.md) | <code>static</code> |  |
|  [updateBounds(bounds, maxZoom)](./cartesian-2d.cartesian2dplotrange.updatebounds.md) |  |  |
|  [updateDataRange(dataRange, canvasDims)](./cartesian-2d.cartesian2dplotrange.updatedatarange.md) |  |  |
