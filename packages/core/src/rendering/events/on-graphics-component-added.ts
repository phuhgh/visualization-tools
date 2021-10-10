import { TListener } from "rc-js-util";
import { IGraphicsComponent } from "../graphics-components/i-graphics-component";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { IEventService } from "../../eventing/event-service";

/**
 * @public
 * Args for {@link TOnGraphicsComponentAdded}.
 */
export type TGraphicsComponentAddedArgs<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TEntityTraits>
    = [graphicsComponent: IGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>]
    ;

/**
 * @public
 * Listener for graphics components added to chart.
 */
export type TOnGraphicsComponentAdded<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TEntityTraits> =
    TListener<"onGraphicsComponentAdded", TGraphicsComponentAddedArgs<TComponentRenderer, TUpdateArg, TEntityTraits>>
    ;

/**
 * @public
 * Emitted on graphics component added to chart.
 */
export class OnGraphicsComponentAdded<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TEntityTraits>
    implements TOnGraphicsComponentAdded<TComponentRenderer, TUpdateArg, TEntityTraits>
{
    public static callbackKey = "onGraphicsComponentAdded" as const;

    public constructor
    (
        public onGraphicsComponentAdded: (...args: TGraphicsComponentAddedArgs<TComponentRenderer, TUpdateArg, TEntityTraits>) => void,
    )
    {
    }

    public static registerListener<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TEntityTraits>
    (
        chartEventService: IEventService,
        onEvent: (...args: TGraphicsComponentAddedArgs<TComponentRenderer, TUpdateArg, TEntityTraits>) => void,
    )
        : () => void
    {
        return chartEventService
            .getCategory<"onGraphicsComponentAdded", TGraphicsComponentAddedArgs<TComponentRenderer, TUpdateArg, TEntityTraits>>(OnGraphicsComponentAdded)
            .addTemporaryListener(new OnGraphicsComponentAdded(onEvent));
    }

    public static emit<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TEntityTraits>
    (
        chartEventService: IEventService,
        graphicsComponent: IGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>,
    )
        : void
    {
        const listeners = chartEventService
            .getCategory(OnGraphicsComponentAdded)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onGraphicsComponentAdded(graphicsComponent);
        }
    }
}