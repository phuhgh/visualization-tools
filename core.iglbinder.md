<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [IGlBinder](./core.iglbinder.md)

## IGlBinder interface

Data binder for webgl graphics components.

<b>Signature:</b>

```typescript
export interface IGlBinder<TComponentRenderer extends TGlBasicComponentRenderer, TConnector> extends IBinder<TComponentRenderer> 
```
<b>Extends:</b> [IBinder](./core.ibinder.md)<!-- -->&lt;TComponentRenderer&gt;

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [specification](./core.iglbinder.specification.md) | [IGlProgramSpec](./core.iglprogramspec.md) |  |

## Methods

|  Method | Description |
|  --- | --- |
|  [bindAttributes(componentRenderer)](./core.iglbinder.bindattributes.md) |  |
|  [bindUniforms(componentRenderer)](./core.iglbinder.binduniforms.md) |  |
|  [update(connector, componentRenderer, changeId)](./core.iglbinder.update.md) | Perform all possible updates. |
|  [updateData(connector, changeId)](./core.iglbinder.updatedata.md) |  |
|  [updatePointers(connector)](./core.iglbinder.updatepointers.md) |  |
