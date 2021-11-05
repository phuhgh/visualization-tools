<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [IHitTestComponent](./core.ihittestcomponent.md)

## IHitTestComponent interface

A component to test if an entity is under the cursor / finger.

<b>Signature:</b>

```typescript
export interface IHitTestComponent<TUpdateArg, TTraits extends IHitTestableTrait, TComponentState> 
```

## Methods

|  Method | Description |
|  --- | --- |
|  [hitTest(entity, dataId, position, updateArg)](./core.ihittestcomponent.hittest.md) | Perform the test. |
|  [index(entity, updateArg, componentState)](./core.ihittestcomponent.index.md) | Where a hit test requires generating / modifying a data structure, this can be done here. |
