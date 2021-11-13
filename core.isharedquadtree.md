<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [ISharedQuadTree](./core.isharedquadtree.md)

## ISharedQuadTree interface

Emscripten quad tree.

<b>Signature:</b>

```typescript
export interface ISharedQuadTree<TArray extends TTypedArray> extends ISharedObject 
```
<b>Extends:</b> ISharedObject

## Remarks

Max results is restricted to 16384 results, good for a 4k screen with 4 elements per quad. For best performance insert large bounding boxes first.

## Methods

|  Method | Description |
|  --- | --- |
|  [addBoundingBox(aabb, elementId, dataId, filterMask)](./core.isharedquadtree.addboundingbox.md) |  |
|  [getQuadElementCount()](./core.isharedquadtree.getquadelementcount.md) |  |
|  [getResults()](./core.isharedquadtree.getresults.md) |  |
|  [queryPoint(point, filterMask)](./core.isharedquadtree.querypoint.md) |  |
|  [setOptions(maxDepth, maxElementsPerNode)](./core.isharedquadtree.setoptions.md) |  |
|  [setTopLevel(range2d)](./core.isharedquadtree.settoplevel.md) |  |
