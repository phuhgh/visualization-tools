import { IVisualizationToolBindings } from "./i-visualization-tool-bindings";
import { IJsUtilBindings } from "rc-js-util";

export const exportedFunctions: { [index in Exclude<keyof IVisualizationToolBindings, keyof IJsUtilBindings>]: boolean } = {
    _f32QuadTree_createTree: true,
    _f32QuadTree_setTopLevel: true,
    _f32QuadTree_queryPoint: true,
    _f32QuadTree_insertRange: true,
    _f32QuadTree_delete: true,
    _quadTree_getResultAddress: true,
    _quadTree_getQuadElementCount: true,
    _quadTree_setOptions: true,
    _f32InterleavedConnector_createOne: true,
    _f32InterleavedConnector_setLength: true,
    _f32InterleavedConnector_setStart: true,
    _f32InterleavedConnector_delete: true,
    _f64InterleavedConnector_createOne: true,
    _f64InterleavedConnector_setLength: true,
    _f64InterleavedConnector_setStart: true,
    _f64InterleavedConnector_delete: true,
};
