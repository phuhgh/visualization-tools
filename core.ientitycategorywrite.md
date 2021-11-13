<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [IEntityCategoryWrite](./core.ientitycategorywrite.md)

## IEntityCategoryWrite interface

The mutative methods of an [IEntityCategory](./core.ientitycategory.md)<!-- -->.

<b>Signature:</b>

```typescript
export interface IEntityCategoryWrite<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TRequiredTraits> 
```

## Methods

|  Method | Description |
|  --- | --- |
|  [addEntity(entity, graphicsComponent, hooks)](./core.ientitycategorywrite.addentity.md) |  |
|  [removeEntity(entity)](./core.ientitycategorywrite.removeentity.md) |  |
|  [setBufferPerEntity(enabled)](./core.ientitycategorywrite.setbufferperentity.md) | Entities that are added after this has been enabled will receive a buffer layout per [ITransformProvider.groupId](./core.itransformprovider.groupid.md)<!-- -->. This can provide a substantial performance increase in conjunction with transforms, in exchange increased memory usage. |
