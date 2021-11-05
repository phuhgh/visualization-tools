<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [HitTestableGroup](./core.hittestablegroup.md)

## HitTestableGroup class

Entities in this group must implement [IHitTestableTrait](./core.ihittestabletrait.md) and have an associated [IHitAllowedComponent](./core.ihitallowedcomponent.md) and [IHitTestComponent](./core.ihittestcomponent.md) which can be accessed through the group. Hit test composition is not currently supported.

<b>Signature:</b>

```typescript
export declare class HitTestableGroup<TPlotRange, TUpdateArg, TComponentState> extends AEntityGroup<IHitTestableGroupOptions<TUpdateArg, IHitTestableTrait, TComponentState>, IHitTestableTrait> implements IHitTestableGroup<TPlotRange, TUpdateArg, TComponentState> 
```
<b>Extends:</b> [AEntityGroup](./core.aentitygroup.md)<!-- -->&lt;[IHitTestableGroupOptions](./core.ihittestablegroupoptions.md)<!-- -->&lt;TUpdateArg, [IHitTestableTrait](./core.ihittestabletrait.md)<!-- -->, TComponentState&gt;, [IHitTestableTrait](./core.ihittestabletrait.md)<!-- -->&gt;

<b>Implements:</b> [IHitTestableGroup](./core.ihittestablegroup.md)<!-- -->&lt;TPlotRange, TUpdateArg, TComponentState&gt;

## Remarks

May be shared by multiple interaction groups, entities should not be added to this group through the plot, this is done by the interaction group. When implementing an interaction group these should use the reference counting methods `refCountingAddEntity` and `refCountingRemoveEntity`<!-- -->.

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(argProvider, plot)](./core.hittestablegroup._constructor_.md) |  | Constructs a new instance of the <code>HitTestableGroup</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [argProvider](./core.hittestablegroup.argprovider.md) |  | [IEntityUpdateArgProvider](./core.ientityupdateargprovider.md)<!-- -->&lt;TPlotRange, TUpdateArg, unknown&gt; |  |
|  [entitiesInGroup](./core.hittestablegroup.entitiesingroup.md) |  | Set&lt;[TEntityTrait](./core.tentitytrait.md)<!-- -->&lt;TUpdateArg, [IHitTestableTrait](./core.ihittestabletrait.md)<!-- -->&gt;&gt; |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [getEntitiesByHitTester()](./core.hittestablegroup.getentitiesbyhittester.md) |  |  |
|  [getHitTester(entity)](./core.hittestablegroup.gethittester.md) |  |  |
|  [onEntityAdded(entity, options)](./core.hittestablegroup.onentityadded.md) |  |  |
|  [onEntityRemoved(entity)](./core.hittestablegroup.onentityremoved.md) |  |  |
|  [refCountingAddEntity(entity, options)](./core.hittestablegroup.refcountingaddentity.md) |  |  |
|  [refCountingRemoveEntity(entity)](./core.hittestablegroup.refcountingremoveentity.md) |  |  |
