import { _Debug, TTypedArray } from "rc-js-util";
import { IGlBuffer } from "./i-gl-buffer";
import { IGlAttribute } from "./i-gl-attribute";

/**
 * @public
 * Sharable state of a webgl attribute.
 */
export interface IAttributeState<TArray extends TTypedArray>
{
    readonly attributes: readonly IGlAttribute<TArray>[];
    buffer: IGlBuffer<TArray>;

    addAttribute(attribute: IGlAttribute<TArray>): void;
}

/**
 * @public
 * {@inheritDoc IAttributeState}
 */
export class AttributeState<TArray extends TTypedArray>
    implements IAttributeState<TArray>
{
    public readonly attributes: IGlAttribute<TArray>[];

    public constructor
    (
        attribute: IGlAttribute<TArray>,
        public buffer: IGlBuffer<TArray>,
    )
    {
        this.attributes = [attribute];
    }

    public addAttribute(attribute: IGlAttribute<TArray>): void
    {
        DEBUG_MODE && _Debug.assert(this.attributes.indexOf(attribute) === -1, "attribute has already been linked");
        this.attributes.push(attribute);
    }
}