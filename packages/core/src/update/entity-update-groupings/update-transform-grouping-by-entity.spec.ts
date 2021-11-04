import { UpdateTransformGroupingByEntity } from "./update-transform-grouping-by-entity";
import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { NoTransformProvider } from "../../rendering/transform-components/no-transform-provider";
import { ITransformComponent } from "../../rendering/transform-components/i-transform-component";
import { TKeysOf } from "rc-js-util";
import { TestComponentRenderer } from "../../test-utils/fakes/test-component-renderer";

describe("=> UpdateTransformGroupingByEntity", () =>
{
    const transformRenderers = [null, null, null];
    const componentRenderers = [new TestComponentRenderer(), new TestComponentRenderer(), new TestComponentRenderer()];

    describe("=> reuseTransforms", () =>
    {
        it("| reuses transform results where sequential", () =>
        {
            // components in an transform group must share buffers => the transform result should be reused
            const a = getTestGraphicsComponent();
            const b = getTestGraphicsComponent();
            const c = getTestGraphicsComponent();
            a.transform.setGroupId(c.transform.groupId);
            const gcs = [a, b, c];
            const transform = createTransformRenderer();
            const transforms = [
                transform,
                createTransformRenderer(),
                transform,
            ];
            const updateGrouping = new TestUpdateTransformGroupingByEntity(gcs, componentRenderers, transforms, transformRenderers);

            expect(updateGrouping.getReuseTransform()).toEqual(new Uint8Array([0, 0, 1]));
        });

        it("| discards transform results where non-sequential", () =>
        {
            const a = getTestGraphicsComponent();
            const b = getTestGraphicsComponent();
            const c = getTestGraphicsComponent();
            a.transform.setGroupId(c.transform.groupId);
            const gcs = [a, b, c];
            const transform = createTransformRenderer();
            const transforms = [
                transform,
                transform,
                transform,
            ];
            const updateGrouping = new TestUpdateTransformGroupingByEntity(gcs, componentRenderers, transforms, transformRenderers);

            expect(updateGrouping.getReuseTransform()).toEqual(new Uint8Array([0, 0, 0]));
        });
    });

    it("| discards transform results where the transforms are different", () =>
    {
        const a = getTestGraphicsComponent();
        const b = getTestGraphicsComponent();
        const c = getTestGraphicsComponent();
        a.transform.setGroupId(c.transform.groupId);
        b.transform.setGroupId(c.transform.groupId);
        const gcs = [a, b, c];
        const transforms = [
            createTransformRenderer(),
            createTransformRenderer(),
            createTransformRenderer(),
        ];
        const updateGrouping = new TestUpdateTransformGroupingByEntity(gcs, componentRenderers, transforms, transformRenderers);

        expect(updateGrouping.getReuseTransform()).toEqual(new Uint8Array([0, 0, 0]));
    });
});

function getTestGraphicsComponent(): IGraphicsComponent<TUnknownComponentRenderer, unknown, unknown>
{
    return jasmine.createSpyObj(
        [],
        { transform: new TestTransform() },
    );
}

function createTransformRenderer(): ITransformComponent<TUnknownComponentRenderer, unknown, unknown>
{
    return jasmine.createSpyObj(["performTransform"] as TKeysOf<ITransformComponent<TUnknownComponentRenderer, unknown, unknown>>);
}

class TestUpdateTransformGroupingByEntity extends UpdateTransformGroupingByEntity<unknown, unknown>
{
    public getReuseTransform(): Uint8Array
    {
        return this.reuseTransform;
    }
}

class TestTransform extends NoTransformProvider
{
    public setGroupId(groupId: number): void
    {
        (this.groupId as number) = groupId;
    }
}