import { CompositeGraphicsComponent } from "./composite-graphics-component";
import { CanvasNoOpGraphicsComponent } from "./canvas-no-op-graphics-component";
import { EGraphicsComponentType } from "../../rendering/graphics-components/e-graphics-component-type";

describe("=> CompositeGraphicsComponent", () =>
{
    describe("=> recurseIterate", () =>
    {
        const l11 = new CanvasNoOpGraphicsComponent();
        const l21 = new CanvasNoOpGraphicsComponent();
        const l22 = new CanvasNoOpGraphicsComponent();
        const nestedCompositeComponent = CompositeGraphicsComponent
            .createOne(l21)
            .addComponent(l22)
            .build();

        const rotComponent = CompositeGraphicsComponent
            .createOne(l11)
            .addComponent(nestedCompositeComponent)
            .build();

        it("filters and recurses (component filter)", () =>
        {
            const callback = jasmine.createSpy();
            rotComponent.recurseIterate(EGraphicsComponentType.Entity, callback);

            expect(callback).toHaveBeenCalledTimes(3);
            expect(callback.calls.allArgs()).toEqual([
                [l11, rotComponent, 0],
                [l21, nestedCompositeComponent, 0],
                [l22, nestedCompositeComponent, 1],
            ]);
        });

        it("filters and recurses (composite component filter)", () =>
        {
            const callback = jasmine.createSpy();
            rotComponent.recurseIterate(EGraphicsComponentType.Composite, callback);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it("recurses where no filter is provided", () =>
        {
            const callback = jasmine.createSpy();
            rotComponent.recurseIterate(callback);

            expect(callback).toHaveBeenCalledTimes(4);
        });
    });
});