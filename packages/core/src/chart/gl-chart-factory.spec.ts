import { GlChartFactory } from "./gl-chart-factory";
import { Gl2ContextAdapter } from "../rendering/gl/context/gl2-context-adapter";
import { ChartConfig } from "./chart-config";
import { GlRendererOptions } from "../rendering/gl/gl-renderer-options";
import { Gl1ContextAdapter } from "../rendering/gl/context/gl1-context-adapter";
import { emptyGlProgramSpecification } from "../rendering/gl/shaders/empty-gl-program-specification";

describe("=> GlChartFactory", () =>
{
    describe("=> compile checks", () =>
    {
        it("| has the right context type", () =>
        {
            const element = document.getElementById("gl-chart") as HTMLElement;

            if (element == null)
            {
                return;
            }

            const chart = GlChartFactory.createOne({
                chartContainer: element,
                contextAdapterCtor: Gl2ContextAdapter,
                chartConfig: new ChartConfig(),
                rendererOptions: new GlRendererOptions([], { preserveDrawingBuffer: true }),
            });

            if (chart != null)
            {
                chart.renderer.context.createVertexArray();
                const componentRenderer = chart.renderer.componentRendererFactory.createRenderer(emptyGlProgramSpecification);
                assertTrue(componentRenderer.isGl2);
            }
        });

        it("| has the right extension type", () =>
        {
            const element = document.getElementById("gl-chart") as HTMLElement;

            if (element == null)
            {
                return;
            }

            const chart = GlChartFactory.createOne({
                chartContainer: element,
                contextAdapterCtor: Gl1ContextAdapter,
                chartConfig: new ChartConfig(),
                rendererOptions: new GlRendererOptions(["OES_vertex_array_object"], { preserveDrawingBuffer: true }),
            });

            if (chart != null)
            {
                const componentRenderer = chart.renderer.componentRendererFactory.createRenderer(emptyGlProgramSpecification);
                assertFalse(componentRenderer.isGl2);

                componentRenderer.extensions.OES_vertex_array_object.createVertexArrayOES();
                // @ts-expect-error - extension not supplied
                componentRenderer.extensions.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(1, 1);
            }
        });
    });
});

function assertTrue(_v: true): void
{
    // compile only
}

function assertFalse(_v: false): void
{
    // compile only
}