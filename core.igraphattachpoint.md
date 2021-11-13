<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [IGraphAttachPoint](./core.igraphattachpoint.md)

## IGraphAttachPoint interface

Wrapper of DOM element that contains the chart, houses hidden canvases as required.

<b>Signature:</b>

```typescript
export interface IGraphAttachPoint 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [canvasDims](./core.igraphattachpoint.canvasdims.md) | [ICanvasDimensions](./core.icanvasdimensions.md) |  |
|  [canvasElement](./core.igraphattachpoint.canvaselement.md) | HTMLCanvasElement |  |
|  [hiddenElement](./core.igraphattachpoint.hiddenelement.md) | HTMLDivElement |  |

## Methods

|  Method | Description |
|  --- | --- |
|  [addHiddenElement(className, tagName)](./core.igraphattachpoint.addhiddenelement.md) |  |
|  [removeHiddenElement(className)](./core.igraphattachpoint.removehiddenelement.md) |  |
|  [resizeCanvas()](./core.igraphattachpoint.resizecanvas.md) | Synchronizes the canvas' actual size with the size set by attribute. Returns the updated size in both css and actual pixels.<!-- -->Do not call directly, call resize on the chart. |
