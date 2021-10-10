<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [OnEntityRemoved](./core.onentityremoved.md) &gt; [registerListener](./core.onentityremoved.registerlistener.md)

## OnEntityRemoved.registerListener() method

<b>Signature:</b>

```typescript
static registerListener<TPlotRange, TRequiredTraits>(plot: IReadonlyPlot<TPlotRange, TRequiredTraits>, onEvent: (...args: TEntityRemovedArgs<TPlotRange, TRequiredTraits>) => void): () => void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  plot | [IReadonlyPlot](./core.ireadonlyplot.md)<!-- -->&lt;TPlotRange, TRequiredTraits&gt; |  |
|  onEvent | (...args: [TEntityRemovedArgs](./core.tentityremovedargs.md)<!-- -->&lt;TPlotRange, TRequiredTraits&gt;) =&gt; void |  |

<b>Returns:</b>

() =&gt; void
