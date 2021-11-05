<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/cartesian-2d](./cartesian-2d.md) &gt; [ICartesian2dPlotRange](./cartesian-2d.icartesian2dplotrange.md) &gt; [updateBounds](./cartesian-2d.icartesian2dplotrange.updatebounds.md)

## ICartesian2dPlotRange.updateBounds() method

<b>Signature:</b>

```typescript
updateBounds(bounds: IReadonlyRange2d<TArray>, maxZoom: number): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  bounds | IReadonlyRange2d&lt;TArray&gt; | Defines the max extent of the plot, will be modified. |
|  maxZoom | number | The max bounds will be divided by this value to determine the maximum zoom. |

<b>Returns:</b>

void
