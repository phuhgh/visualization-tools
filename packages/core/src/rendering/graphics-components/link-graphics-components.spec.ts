import { ILinkableGraphicsComponent } from "./i-linkable-graphics-component";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { EGraphicsComponentType } from "./e-graphics-component-type";
import { ILinkableBinder } from "../generic-binders/i-linkable-binder";
import { NoTransformProvider } from "../transform-components/no-transform-provider";
import { linkGraphicsComponents } from "./link-graphics-components";

describe("=> linkGraphicsComponents", () =>
{
    const a = Symbol("A");
    const b = Symbol("B");
    // the binder classification is used to dynamically create programs, not important in this test
    const unusedSymbol = Symbol("unused");

    it("| links binders with the same linkId", () =>
    {
        const a1: ILinkableBinder<TUnknownComponentRenderer> = new LinkableTestBinder(a, unusedSymbol);
        const a2: ILinkableBinder<TUnknownComponentRenderer> = new LinkableTestBinder(a, unusedSymbol);
        const b1: ILinkableBinder<TUnknownComponentRenderer> = new LinkableTestBinder(b, unusedSymbol);
        const gc1 = new LinkableTestComp([a1, b1]);
        const gc2 = new LinkableTestComp([a2]);
        const a1Spy = spyOn(a1, "link");
        const a2Spy = spyOn(a2, "link");
        linkGraphicsComponents([gc1, gc2]);
        expect(a2Spy).toHaveBeenCalledTimes(1);
        expect(a2Spy.calls.mostRecent().args[0]).toEqual([a1]);
        expect(a1Spy).not.toHaveBeenCalled();
    });

    it("| creates transform groups where there is a single linked binder", () =>
    {
        const a2: ILinkableBinder<TUnknownComponentRenderer> = new LinkableTestBinder(a, unusedSymbol);
        const a1: ILinkableBinder<TUnknownComponentRenderer> = new LinkableTestBinder(a, unusedSymbol);
        const gc1 = new LinkableTestComp([a1]);
        const gc2 = new LinkableTestComp([a2]);

        linkGraphicsComponents([gc1, gc2]);
        expect(gc1.transform.groupId).toBe(gc2.transform.groupId);
    });

    it("| doesn't create transform groups where there is more than one binder", () =>
    {
        const a1: ILinkableBinder<TUnknownComponentRenderer> = new LinkableTestBinder(a, unusedSymbol);
        const a2: ILinkableBinder<TUnknownComponentRenderer> = new LinkableTestBinder(a, unusedSymbol);
        const b1: ILinkableBinder<TUnknownComponentRenderer> = new LinkableTestBinder(b, unusedSymbol);
        const gc1 = new LinkableTestComp([a1, b1]);
        const gc2 = new LinkableTestComp([a2]);

        linkGraphicsComponents([gc1, gc2]);
        expect(gc1.transform.groupId).not.toBe(gc2.transform.groupId);
    });
});

class LinkableTestComp implements ILinkableGraphicsComponent<TUnknownComponentRenderer, unknown, unknown>
{
    public readonly specification = {};
    public readonly type = EGraphicsComponentType.Entity;
    public readonly transform = new TestTransformProvider();

    public constructor
    (
        private binders: ILinkableBinder<TUnknownComponentRenderer>[],
    )
    {
    }

    public getCacheId(): string
    {
        return "";
    }

    public getLinkableBinders(): ILinkableBinder<TUnknownComponentRenderer>[]
    {
        return this.binders;
    }

    public initialize(): void
    {
        // not required for test
    }

    public onBeforeUpdate(): void
    {
        // not required for test
    }

    public update(): void
    {
        // not required for test
    }
}

class LinkableTestBinder implements ILinkableBinder<TUnknownComponentRenderer>
{
    public constructor
    (
        public readonly linkId: string | symbol,
        public readonly binderClassificationId: symbol,
    )
    {
    }

    public getBinderId(): string
    {
        return "";
    }

    public initialize(): void
    {
        // not required for test
    }

    public link(): void
    {
        // not required for test
    }
}

class TestTransformProvider extends NoTransformProvider
{
    public setGroupId(groupId: number): void
    {
        (this.groupId as number) = groupId;
    }
}