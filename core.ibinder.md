<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [IBinder](./core.ibinder.md)

## IBinder interface

Base data binder, provides a key which indicates that it meets a specification for binding data in e.g. shaders. This is used to match up transform components with an appropriate binder.

<b>Signature:</b>

```typescript
export interface IBinder<TComponentRenderer extends TUnknownComponentRenderer> 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [binderClassificationId](./core.ibinder.binderclassificationid.md) | symbol | The classification of binder, e.g. a binder of points in 2d. |

## Methods

|  Method | Description |
|  --- | --- |
|  [getBinderId()](./core.ibinder.getbinderid.md) | A unique identifier for the program backing the binder. |
|  [initialize(componentRenderer)](./core.ibinder.initialize.md) |  |
