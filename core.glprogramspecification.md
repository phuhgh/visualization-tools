<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@visualization-tools/core](./core.md) &gt; [GlProgramSpecification](./core.glprogramspecification.md)

## GlProgramSpecification class

Specification of a webgl program to build.

<b>Signature:</b>

```typescript
export declare class GlProgramSpecification implements IGlProgramSpec 
```
<b>Implements:</b> [IGlProgramSpec](./core.iglprogramspec.md)

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(vertexShader, fragmentShader, requiredExtensions, optionalExtensions, outAttributes)](./core.glprogramspecification._constructor_.md) |  | Constructs a new instance of the <code>GlProgramSpecification</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [fragmentShader](./core.glprogramspecification.fragmentshader.md) |  | [IGlShader](./core.iglshader.md) |  |
|  [optionalExtensions](./core.glprogramspecification.optionalextensions.md) |  | readonly (keyof [IGlExtensions](./core.iglextensions.md)<!-- -->)\[\] |  |
|  [outAttributes](./core.glprogramspecification.outattributes.md) |  | readonly string\[\] \| null |  |
|  [requiredExtensions](./core.glprogramspecification.requiredextensions.md) |  | readonly (keyof [IGlExtensions](./core.iglextensions.md)<!-- -->)\[\] |  |
|  [shaderLanguageVersion](./core.glprogramspecification.shaderlanguageversion.md) |  | number \| undefined |  |
|  [vertexShader](./core.glprogramspecification.vertexshader.md) |  | [IGlShader](./core.iglshader.md) |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [mergeProgramSpecifications(specs)](./core.glprogramspecification.mergeprogramspecifications.md) | <code>static</code> |  |
