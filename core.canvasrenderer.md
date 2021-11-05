<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [CanvasRenderer](./core.canvasrenderer.md)

## CanvasRenderer class

Canvas implementation of [IRenderer](./core.irenderer.md)<!-- -->.

<b>Signature:</b>

```typescript
export declare class CanvasRenderer implements ICanvasRenderer 
```
<b>Implements:</b> [ICanvasRenderer](./core.icanvasrenderer.md)

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(context, callbacks)](./core.canvasrenderer._constructor_.md) |  | Constructs a new instance of the <code>CanvasRenderer</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [componentRendererFactory](./core.canvasrenderer.componentrendererfactory.md) |  | [IComponentRendererFactory](./core.icomponentrendererfactory.md)<!-- -->&lt;{}, [ICanvasComponentRenderer](./core.icanvascomponentrenderer.md)<!-- -->&gt; |  |
|  [componentRendererProvider](./core.canvasrenderer.componentrendererprovider.md) |  | [IComponentRendererProvider](./core.icomponentrendererprovider.md)<!-- -->&lt;[ICanvasComponentRenderer](./core.icanvascomponentrenderer.md)<!-- -->&gt; |  |
|  [context](./core.canvasrenderer.context.md) |  | CanvasRenderingContext2D |  |
|  [graphicsComponents](./core.canvasrenderer.graphicscomponents.md) |  | [GraphicsComponentStore](./core.graphicscomponentstore.md)<!-- -->&lt;[ICanvasComponentRenderer](./core.icanvascomponentrenderer.md)<!-- -->&gt; |  |
|  [sharedState](./core.canvasrenderer.sharedstate.md) |  | [CanvasRendererSharedState](./core.canvasrenderersharedstate.md) |  |
|  [TComponentRenderer](./core.canvasrenderer.tcomponentrenderer.md) |  | [ICanvasComponentRenderer](./core.icanvascomponentrenderer.md) |  |
|  [transformComponents](./core.canvasrenderer.transformcomponents.md) |  | [ITransformComponentStore](./core.itransformcomponentstore.md)<!-- -->&lt;[ICanvasComponentRenderer](./core.icanvascomponentrenderer.md)<!-- -->&gt; |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [createOne(context, callbacks)](./core.canvasrenderer.createone.md) | <code>static</code> |  |
|  [onAfterPlotDraw()](./core.canvasrenderer.onafterplotdraw.md) |  |  |
|  [onBeforePlotDraw(plot, canvasDims)](./core.canvasrenderer.onbeforeplotdraw.md) |  |  |
|  [onContextLost()](./core.canvasrenderer.oncontextlost.md) |  |  |
|  [onContextRegained(context)](./core.canvasrenderer.oncontextregained.md) |  |  |
