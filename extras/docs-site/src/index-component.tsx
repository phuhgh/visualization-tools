import React, { useState } from "react";
import { _Fp, _Production, BroadcastEvent, IEmscriptenWrapper } from "rc-js-util";
import { ICartesian2dBindings } from "@visualization-tools/cartesian-2d";
import { ArrowRight, GitHub } from "@mui/icons-material";
import { TDemoEvents } from "./demos/events/t-demo-events";
import { EDemoEvent } from "./demos/events/e-demo-event";
import { enterDemoMode } from "./demos/enter-demo-mode";
import { exitDemoMode } from "./demos/exit-demo-mode";
import { MaximizeDemoEvent } from "./demos/events/maximize-demo-event";
import { MinimizeDemoEvent } from "./demos/events/minimize-demo-event";
import { ResizeDemoCommand } from "./demos/commands/resize-demo-command";
import { TDemoCommandChannel } from "./demos/i-demo-props";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import { GlCartesianPlotDemoComponent } from "./demos/cartesian2d/gl/gl-cartesian-plot-demo-component";
import { CanvasCartesianPlotDemoComponent } from "./demos/cartesian2d/canvas/canvas-cartesian-plot-demo-component";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

export type TIndexEvents =
    | MaximizeDemoEvent
    | MinimizeDemoEvent
    ;

export interface IIndexComponentProps
{
    emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>;
    rootElement: HTMLDivElement;
}

export function IndexComponent(props: IIndexComponentProps): React.ReactElement
{
    const [commandChannel] = useState<TDemoCommandChannel>(() => new BroadcastEvent("onDemoCommand"));
    React.useEffect(() =>
    {
        const resize = _Fp.debounce(250, false, () => commandChannel.emit(new ResizeDemoCommand()));
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);
    const onDemoEvent = filterDemoEvents(createIndexEventHandler(props));

    return (
        <div className="content-root overflow-y-auto flex110">

            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" className="flex110">Visualization Tools </Typography>
                    <IconButton size="large"
                                edge="end"
                                href="https://github.com/phuhgh/visualization-tools/"
                                color="inherit">
                        <GitHub/>
                    </IconButton>
                </Toolbar>
            </AppBar>

            <section className="clear-padding section-padding">
                <Typography variant="body1">A JavaScript and WebAssembly library for visualizing millions of data points
                    interactively in real time.</Typography>
            </section>

            <section className="clear-padding section-padding">
                <Typography variant="h6" component="div">Demos</Typography>
                <div className="demos">

                    <GlCartesianPlotDemoComponent onDemoEvent={onDemoEvent}
                                                  emscriptenModule={props.emscriptenModule}
                                                  demoCommandChannel={commandChannel}/>
                    <CanvasCartesianPlotDemoComponent onDemoEvent={onDemoEvent}
                                                      emscriptenModule={props.emscriptenModule}
                                                      demoCommandChannel={commandChannel}/>
                </div>
            </section>

            <section className="clear-padding section-padding">
                <Typography variant="h6" component="div">Architecture</Typography>
                <Typography variant="body1" component="div" sx={{ mb: 1.5 }}>
                    Visualization tools is at its core an entity component system, making it highly composable. It has
                    been designed to scale with hardware by mixing load between the CPU and GPU, and allows for
                    extension with C++ plugins for performance critical sections. Various render targets are supported:
                    <List dense>
                        <ListItem disableGutters><ArrowRight/> Canvas</ListItem>
                        <ListItem disableGutters><ArrowRight/> WebGL 1 and 2</ListItem>
                        <ListItem disableGutters><ArrowRight/> WebGPU - WIP</ListItem>
                    </List>
                </Typography>
                <Typography variant="body1" component="div" sx={{ mb: 1.5 }}>
                    Visualization tools comes with numerous update strategies to maximize performance for various use
                    cases, such as grouped by component or by entity. It supports both buffer per entity and automatic
                    sharing of buffers between graphics components to minimize redundant compute and IO. The default
                    interaction handler is a quad tree written in C++ which is incrementally updated to avoid blocking
                    the UI.
                </Typography>
                <Typography variant="body1" component="div" sx={{ mb: 1.5 }}>
                    Visualization tools has been designed for integration in applications, it makes minimal assumptions
                    about intended use, and avoids performing any work unless instructed to do so.
                </Typography>
            </section>
        </div>
    );
}

function filterDemoEvents(onIndexEvent: ($event: TIndexEvents) => void)
{
    return function <TTraits>($event: TDemoEvents<TTraits>): void
    {
        switch ($event.id)
        {
            case EDemoEvent.ProxyPlotCommand:
            case EDemoEvent.ResetDemo:
            case EDemoEvent.EntitySelectionChanged:
                // no action required
                break;
            case EDemoEvent.MaximizeDemo:
            case EDemoEvent.MinimizeDemo:
                onIndexEvent($event);
                break;
            default:
                _Production.assertValueIsNever($event);
                break;
        }
    };
}

function createIndexEventHandler(props: IIndexComponentProps)
{
    return function onEvent($event: TIndexEvents)
    {
        switch ($event.id)
        {
            case EDemoEvent.MaximizeDemo:
                enterDemoMode(props.rootElement);
                break;
            case EDemoEvent.MinimizeDemo:
                exitDemoMode(props.rootElement);
                break;
            default:
                _Production.assertValueIsNever($event);
                break;
        }
    };
}