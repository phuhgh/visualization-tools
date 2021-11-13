<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/cartesian-2d](./cartesian-2d.md) &gt; [Cartesian2dTransforms](./cartesian-2d.cartesian2dtransforms.md)

## Cartesian2dTransforms class

Provides data transforms useful for drawing and interaction handling. Created by [ICartesian2dUpdateArgProvider](./cartesian-2d.icartesian2dupdateargprovider.md)<!-- -->.

<b>Signature:</b>

```typescript
export declare class Cartesian2dTransforms<TCtor extends TTypedArrayCtor> implements ICartesian2dTransforms<InstanceType<TCtor>> 
```
<b>Implements:</b> [ICartesian2dTransforms](./cartesian-2d.icartesian2dtransforms.md)<!-- -->&lt;InstanceType&lt;TCtor&gt;&gt;

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(ctor)](./cartesian-2d.cartesian2dtransforms._constructor_.md) |  | Constructs a new instance of the <code>Cartesian2dTransforms</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [dataToInteractiveArea](./cartesian-2d.cartesian2dtransforms.datatointeractivearea.md) |  | Mat3&lt;InstanceType&lt;TCtor&gt;&gt; |  |
|  [dataToInteractiveSize](./cartesian-2d.cartesian2dtransforms.datatointeractivesize.md) |  | Mat3&lt;InstanceType&lt;TCtor&gt;&gt; |  |
|  [dataToPlotArea](./cartesian-2d.cartesian2dtransforms.datatoplotarea.md) |  | Mat3&lt;InstanceType&lt;TCtor&gt;&gt; |  |
|  [dataToPlotSize](./cartesian-2d.cartesian2dtransforms.datatoplotsize.md) |  | Mat3&lt;InstanceType&lt;TCtor&gt;&gt; |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [update(dataRange, plotArea, interactionArea)](./cartesian-2d.cartesian2dtransforms.update.md) |  |  |
