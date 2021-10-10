import { addEntityToCategory } from "./add-entity-to-category";
import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { TGl2ComponentRenderer } from "../../rendering/gl/component-renderer/t-gl2-component-renderer";
import { GlNoOpGraphicsComponent } from "../components/gl-no-op-graphics-component";
import { ChartEntity } from "../chart-entity";
import { IncrementingIdentifierFactory } from "rc-js-util";
import { IEntityCategory } from "./i-entity-category";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { ICategoryUpdateHooks } from "./i-category-update-hooks";
import { TUnknownRenderer } from "../../rendering/t-unknown-renderer";
import { TEntityTrait } from "../traits/t-entity-trait";
import { CompositeGraphicsComponent } from "../components/composite-graphics-component";
import { ILinkableGraphicsComponent } from "../../rendering/graphics-components/i-linkable-graphics-component";
import { ILinkableBinder } from "../../rendering/generic-binders/i-linkable-binder";

describe("=> addEntityToCategory", () =>
{
    describe("=> compile checks", () =>
    {
        describe("=> add gl components", () =>
        {
            it("| does not compile where extensions are missing (empty set)", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer, unknown, unknown> = new TestCategory();
                const gc: IGraphicsComponent<TGl2ComponentRenderer<"EXT_sRGB">, unknown, unknown> = new TestGlComp();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                // @ts-expect-error - system renderer missing required extension
                addEntityToCategory(category, entity, gc);
            });

            it("| does not compile where extensions are missing (disjoint set)", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer<"EXT_frag_depth">, unknown, unknown> = new TestCategory();
                const gc: IGraphicsComponent<TGl2ComponentRenderer<"EXT_sRGB">, unknown, unknown> = new TestGlComp();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                // @ts-expect-error - system renderer missing required extension
                addEntityToCategory(category, entity, gc);
            });

            it("| does not compile where extensions are missing", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer<"ANGLE_instanced_arrays">, unknown, unknown> = new TestCategory();
                const gc: IGraphicsComponent<TGl2ComponentRenderer<"EXT_sRGB" | "ANGLE_instanced_arrays">, unknown, unknown> = new TestGlComp();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                // @ts-expect-error - system renderer missing required extension
                addEntityToCategory(category, entity, gc);
            });

            it("| compiles where extensions are provided but none are used", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer<"EXT_sRGB" | "ANGLE_instanced_arrays">, unknown, unknown> = new TestCategory();
                const gc: IGraphicsComponent<TGl2ComponentRenderer, unknown, unknown> = new TestGlComp();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                addEntityToCategory(category, entity, gc);
            });

            it("| compiles where extensions are provided and used", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer<"EXT_sRGB" | "EXT_frag_depth" | "OES_texture_float">, unknown, unknown> = new TestCategory();
                const gc: IGraphicsComponent<TGl2ComponentRenderer<"EXT_frag_depth">, unknown, unknown> = new TestGlComp();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                addEntityToCategory(category, entity, gc);
            });
        });

        describe("=> add gl composite components", () =>
        {
            it("| does not compile where extensions are missing (empty set)", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer, unknown, unknown> = new TestCategory();
                const gc1: IGraphicsComponent<TGl2ComponentRenderer<"EXT_sRGB">, unknown, unknown> = new TestGlComp();
                const gc2: IGraphicsComponent<TGl2ComponentRenderer<"EXT_frag_depth">, unknown, unknown> = new TestGlComp();
                const cgc = CompositeGraphicsComponent
                    .createOne(gc1)
                    .addComponent(gc2)
                    .build();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                // @ts-expect-error - system renderer missing required extension
                addEntityToCategory(category, entity, cgc);
            });

            it("| does not compile where extensions are missing (disjoint set)", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer<"OES_texture_half_float">, unknown, unknown> = new TestCategory();
                const gc1: IGraphicsComponent<TGl2ComponentRenderer<"EXT_sRGB">, unknown, unknown> = new TestGlComp();
                const gc2: IGraphicsComponent<TGl2ComponentRenderer<"EXT_frag_depth">, unknown, unknown> = new TestGlComp();
                const cgc = CompositeGraphicsComponent
                    .createOne(gc1)
                    .addComponent(gc2)
                    .build();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                // @ts-expect-error - system renderer missing required extension
                addEntityToCategory(category, entity, cgc);
            });

            it("| compiles where extensions are provided but none are used", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer<"EXT_sRGB" | "ANGLE_instanced_arrays">, unknown, unknown> = new TestCategory();
                const gc1: IGraphicsComponent<TGl2ComponentRenderer, unknown, unknown> = new TestGlComp();
                const gc2: IGraphicsComponent<TGl2ComponentRenderer, unknown, unknown> = new TestGlComp();
                const cgc = CompositeGraphicsComponent
                    .createOne(gc1)
                    .addComponent(gc2)
                    .build();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                addEntityToCategory(category, entity, cgc);
            });

            it("| compiles where extensions are provided and used", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer<"EXT_sRGB" | "EXT_frag_depth" | "OES_texture_float">, unknown, unknown> = new TestCategory();
                const gc1: IGraphicsComponent<TGl2ComponentRenderer<"EXT_sRGB">, unknown, unknown> = new TestGlComp();
                const gc2: IGraphicsComponent<TGl2ComponentRenderer<"EXT_frag_depth">, unknown, unknown> = new TestGlComp();
                const cgc = CompositeGraphicsComponent
                    .createOne(gc1)
                    .addComponent(gc2)
                    .build();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                addEntityToCategory(category, entity, cgc);
            });
        });

        describe("=> add gl linked composite components", () =>
        {
            it("| does not compile where extensions are missing (empty set)", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer, unknown, unknown> = new TestCategory();
                const gc1 = new TestGlComp() as ILinkableGraphicsComponent<TGl2ComponentRenderer<"EXT_sRGB">, unknown, unknown>;
                const gc2 = new TestGlComp() as ILinkableGraphicsComponent<TGl2ComponentRenderer<"EXT_frag_depth">, unknown, unknown>;
                const cgc = CompositeGraphicsComponent
                    .createOneLinked(gc1)
                    .addComponent(gc2)
                    .build();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                // @ts-expect-error - system renderer missing required extension
                addEntityToCategory(category, entity, cgc);
            });

            it("| does not compile where extensions are missing", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer<"EXT_sRGB">, unknown, unknown> = new TestCategory();
                const gc1 = new TestGlComp() as ILinkableGraphicsComponent<TGl2ComponentRenderer<"EXT_sRGB">, unknown, unknown>;
                const gc2 = new TestGlComp() as ILinkableGraphicsComponent<TGl2ComponentRenderer<"OES_vertex_array_object">, unknown, unknown>;
                const cgc = CompositeGraphicsComponent
                    .createOneLinked(gc1)
                    .addComponent(gc2)
                    .build();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                // @ts-expect-error - system renderer missing required extension
                addEntityToCategory(category, entity, cgc);
            });

            it("| compiles where extensions are provided but none are used", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer<"EXT_sRGB" | "ANGLE_instanced_arrays">, unknown, unknown> = new TestCategory();
                const gc1 = new TestGlComp() as ILinkableGraphicsComponent<TGl2ComponentRenderer, unknown, unknown>;
                const gc2 = new TestGlComp() as ILinkableGraphicsComponent<TGl2ComponentRenderer, unknown, unknown>;
                const cgc = CompositeGraphicsComponent
                    .createOneLinked(gc1)
                    .addComponent(gc2)
                    .build();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                addEntityToCategory(category, entity, cgc);
            });

            it("| compiles where extensions are provided and used", () =>
            {
                const category: IEntityCategory<TGl2ComponentRenderer<"EXT_sRGB" | "EXT_frag_depth" | "OES_texture_float">, unknown, unknown> = new TestCategory();
                const gc1 = new TestGlComp() as ILinkableGraphicsComponent<TGl2ComponentRenderer<"EXT_sRGB">, unknown, unknown>;
                const gc2 = new TestGlComp() as ILinkableGraphicsComponent<TGl2ComponentRenderer<"EXT_frag_depth">, unknown, unknown>;
                const cgc = CompositeGraphicsComponent
                    .createOneLinked(gc1)
                    .addComponent(gc2)
                    .build();
                const entity = new ChartEntity(new IncrementingIdentifierFactory());
                addEntityToCategory(category, entity, cgc);
            });
        });
    });
});

class TestGlComp
    extends GlNoOpGraphicsComponent
    implements ILinkableGraphicsComponent<TGl2ComponentRenderer<"EXT_sRGB">, unknown, unknown>
{
    public getLinkableBinders(): ILinkableBinder<TGl2ComponentRenderer<"EXT_sRGB">>[]
    {
        return [];
    }
}

class TestCategory<TComponentRenderer extends TUnknownComponentRenderer>
    implements IEntityCategory<TComponentRenderer, unknown, unknown>
{
    public readonly updateHooks!: ICategoryUpdateHooks<TUnknownRenderer, unknown>;

    public addEntity(): void
    {
        // no action needed
    }

    public getEntities(): TEntityTrait<unknown, unknown>[]
    {
        return [];
    }

    public removeEntity(): void
    {
        // no action needed
    }

    public TComponentRenderer!: TComponentRenderer;
}