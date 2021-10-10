import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { _Debug, _Map } from "rc-js-util";
import { ILinkableBinder } from "../generic-binders/i-linkable-binder";
import { ILinkableGraphicsComponent } from "./i-linkable-graphics-component";
import { EGraphicsComponentType } from "./e-graphics-component-type";

/**
 * @public
 * Shares compatible buffers between components, so updates to one affect all.
 */
export function linkGraphicsComponents
(
    graphicsComponents: readonly ILinkableGraphicsComponent<TUnknownComponentRenderer, unknown, unknown>[],
)
    : void
{
    if (graphicsComponents.length < 2)
    {
        DEBUG_MODE && _Debug.error("attempted to link to nothing...");
        return;
    }

    const bindersToLink = new Map<string, ILinkableBinder<TUnknownComponentRenderer>[]>();
    const gcGroups = new Map<string, ILinkableGraphicsComponent<TUnknownComponentRenderer, unknown, unknown>[]>();

    for (let i = 0, iEnd = graphicsComponents.length; i < iEnd; ++i)
    {
        const graphicsComponent = graphicsComponents[i];
        DEBUG_MODE && _Debug.assert(graphicsComponent.type === EGraphicsComponentType.Entity, "expected entity renderer");
        const binders = graphicsComponent.getLinkableBinders();

        if (binders.length === 1)
        {
            _Map.push(gcGroups, binders[0].linkId, graphicsComponent);
        }

        for (let j = 0, jEnd = binders.length; j < jEnd; ++j)
        {
            const binder = binders[j];
            _Map.push(bindersToLink, binder.linkId, binder);
        }
    }

    for (const linkableBinders of bindersToLink.values())
    {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const last = linkableBinders.pop()!;
        last.link(linkableBinders);
    }

    for (const linkableGcs of gcGroups.values())
    {
        const groupId = linkableGcs[0].transform.groupId;

        for (let i = 1, iEnd = linkableGcs.length; i < iEnd; ++i)
        {
            linkableGcs[i].transform.setGroupId(groupId);
        }
    }
}